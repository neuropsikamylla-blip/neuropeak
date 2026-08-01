"""Recorte de fundo branco -> PNG com alfa real (Informação em Foco, 01/ago/2026).

Como as imagens dela são geradas com fundo branco liso, o recorte precisa de dois
cuidados que só apareceram na conferência VISUAL:

1. NÃO comer o branco da própria embalagem (sal, leite, polvilho, goma, iogurte,
   adoçante, suco de laranja). Foi o erro da 1ª tentativa: flood fill com tolerância
   alta entra pela parte branca da embalagem que encosta no fundo sem contorno escuro.
2. NÃO deixar a sombra do fundo virar borrão cinza.

Solução: o contorno vem das BORDAS (Canny) somadas ao núcleo colorido (dif > 18);
fecha-se o traçado, preenchem-se os buracos (isso devolve o branco interno) e a
abertura solta a sombra, que não forma contorno fechado.

Se a imagem JÁ vier com alfa (ela às vezes manda assim), o alfa dela é respeitado.

Uso:
    from recorte_fundo_branco import recortar
    recortar("entrada.png").save("saida.png")   # 360x360 RGBA
"""
import numpy as np, cv2
from PIL import Image
from scipy import ndimage

NUCLEO = 18          # dif = distância à cor do fundo (amostrada nas bordas)
CANNY = (8, 24)      # limiares baixos: a aresta da embalagem branca é sutil
FECHA, ABRE = 9, 5


def cor_do_fundo(rgb: np.ndarray, m: int = 12) -> np.ndarray:
    """Fundo nem sempre é branco — a gelatina dela veio com fundo creme."""
    borda = np.concatenate([rgb[:m].reshape(-1, 3), rgb[-m:].reshape(-1, 3),
                            rgb[:, :m].reshape(-1, 3), rgb[:, -m:].reshape(-1, 3)])
    return np.median(borda, axis=0)


def envelope(rgb: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(rgb, cv2.COLOR_RGB2GRAY)
    dif = np.abs(rgb.astype(int) - cor_do_fundo(rgb)[None, None, :]).max(axis=2)
    edges = cv2.Canny(cv2.GaussianBlur(gray, (3, 3), 0), *CANNY)
    m = ((edges > 0) | (dif > NUCLEO)).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((FECHA, FECHA), np.uint8))
    env = ndimage.binary_fill_holes(m > 0).astype(np.uint8)
    env = cv2.morphologyEx(env, cv2.MORPH_OPEN, np.ones((ABRE, ABRE), np.uint8))
    n, lab, stats, _ = cv2.connectedComponentsWithStats(env, 8)
    if n > 1:
        area = stats[1:, cv2.CC_STAT_AREA].max()
        keep = np.zeros_like(env)
        for i in range(1, n):
            if stats[i, cv2.CC_STAT_AREA] >= max(400, area * 0.08):
                keep[lab == i] = 1
        env = ndimage.binary_fill_holes(keep > 0).astype(np.uint8)
    return env


def recortar(path: str, size: int = 360, ocupacao: float = 0.94) -> Image.Image:
    rgba0 = np.array(Image.open(path).convert("RGBA"))
    if rgba0[..., 3].min() == 0:                    # já veio transparente: respeita
        rgb, alpha = rgba0[..., :3], rgba0[..., 3]
    else:
        rgb = rgba0[..., :3]
        alpha = (envelope(rgb) * 255).astype(np.uint8)
        alpha = cv2.erode(alpha, np.ones((3, 3), np.uint8), 1)   # mata a franja branca
        alpha = cv2.GaussianBlur(alpha, (3, 3), 0)               # antialias
    ys, xs = np.where(alpha > 8)
    rec = np.dstack([rgb, alpha])[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    h, w = rec.shape[:2]
    esc = (size * ocupacao) / max(h, w)             # proporção preservada (não deforma)
    nw, nh = max(1, round(w * esc)), max(1, round(h * esc))
    red = cv2.resize(rec, (nw, nh), interpolation=cv2.INTER_AREA)
    tela = np.zeros((size, size, 4), np.uint8)
    tela[(size - nh) // 2:(size - nh) // 2 + nh, (size - nw) // 2:(size - nw) // 2 + nw] = red
    return Image.fromarray(tela, "RGBA")
