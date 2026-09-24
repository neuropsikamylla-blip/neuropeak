"""Acha o circulo numerado no canto do quadro e reconstroi o fundo por inpainting."""
import cv2, numpy as np, sys

def acha_circulo(bgr, frac=0.30):
    """Procura o disco claro no canto superior esquerdo. Devolve a mascara."""
    h, w = bgr.shape[:2]
    jan = bgr[:int(h*frac), :int(w*frac)]
    cinza = cv2.cvtColor(jan, cv2.COLOR_BGR2GRAY)
    circulos = cv2.HoughCircles(
        cinza, cv2.HOUGH_GRADIENT, dp=1, minDist=40,
        param1=90, param2=26,
        minRadius=int(min(h, w) * 0.030), maxRadius=int(min(h, w) * 0.085),
    )
    masc = np.zeros((h, w), np.uint8)
    if circulos is None:
        return masc, None
    # O disco tem borda branca e NUMERO ESCURO no meio. Medir o interior cheio faz o
    # numero derrubar a media -- foi assim que 13 cenas passaram com o gabarito impresso
    # na primeira tentativa. Mede-se o ANEL entre 0,62r e 0,92r, que e branco puro.
    melhor, brilho_max = None, -1
    for x, y, r in np.uint16(np.around(circulos[0])):
        anel = np.zeros(cinza.shape, np.uint8)
        cv2.circle(anel, (x, y), max(1, int(r * 0.92)), 255, -1)
        cv2.circle(anel, (x, y), max(1, int(r * 0.62)), 0, -1)
        b = cv2.mean(cinza, mask=anel)[0]
        if b > brilho_max:
            brilho_max, melhor = b, (int(x), int(y), int(r))
    if brilho_max < 170:      # anel escuro: nao e o disco do numero
        return masc, None
    x, y, r = melhor
    cv2.circle(masc, (x, y), int(r * 1.22), 255, -1)   # folga para pegar a borda
    return masc, melhor

def limpa(bgr):
    masc, achou = acha_circulo(bgr)
    if achou is None:
        return bgr, None
    return cv2.inpaint(bgr, masc, 7, cv2.INPAINT_NS), achou

if __name__ == "__main__":
    entrada, saida = sys.argv[1], sys.argv[2]
    img = cv2.imread(entrada)
    out, achou = limpa(img)
    cv2.imwrite(saida, out)
    print(f"{entrada.split('/')[-1]}: circulo {achou}")

# ---------------------------------------------------------------------------
# POR QUE ESTE SCRIPT EXISTE (23/set/2026)
#
# As pranchas trazem um disco branco numerado no canto de cada quadro. Esse numero
# E O GABARITO: se for junto no corte, o paciente le a resposta em vez de deduzi-la.
#
# O cortador usado em junho (nao versionado, perdido) removia o numero colando um
# bloco de outra parte da imagem por cima. Funcionava para esconder o numero, mas
# deixava um retangulo visivel e deslocava a arte — esta assim nas 76 historias em
# producao hoje.
#
# Este usa inpainting (Navier-Stokes) a partir dos pixels vizinhos: reconstroi o
# fundo em vez de tapar. Comparado lado a lado, a diferenca e grande.
#
# MELHOR AINDA, para pranchas novas: pedir ao gerador o numero FORA do quadro
# (numa faixa acima de cada cena). Ai o corte simplesmente descarta a faixa e nao
# ha o que reconstruir. Este script continua util como rede de seguranca.
# ---------------------------------------------------------------------------
