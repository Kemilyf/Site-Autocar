# Auto Car Serviços Viseu

Landing page institucional da **Auto Car Serviços Viseu**, oficina automóvel em Viseu, Portugal.

O site foi pensado para apresentar os serviços, transmitir confiança, facilitar o contacto e permitir que o visitante envie um pedido de marcação diretamente para o WhatsApp da oficina.

## Estado do projeto

- Projeto estático em HTML, CSS e JavaScript.
- Idioma: português de Portugal (`pt-PT`).
- Identidade visual: preto, vermelho, branco e cinzento.
- Layout responsivo para computador e telemóvel.
- Formulário de pedido de marcação que prepara uma mensagem para o WhatsApp.
- Botão flutuante do WhatsApp.
- Morada e mapa de localização.
- **Esta branch é de desenvolvimento.** Não publicar em produção até validar textos, contactos, imagens e funcionamento.

## Estrutura principal

```
Site-Autocar/
├── index.html
├── logo.jpg
├── logo-autocar.jpg
├── mecanicageral.jpg
└── assets/
    └── css/
        └── styles.css
```

> Os nomes acima são os caminhos referenciados atualmente no HTML. Confirme no separador **Code** do GitHub quais os ficheiros que já existem na branch. As fotografias novas devem ser adicionadas ao repositório antes de serem referenciadas no HTML.

## Como executar e pré-visualizar localmente

1. Instale o Visual Studio Code.
2. Abra **File → Open Folder** e selecione a pasta do repositório.
3. No terminal do VS Code, execute:

   ```bash
   git fetch origin
   git switch redesign/galeria-fotos-reais
   git pull origin redesign/galeria-fotos-reais
   ```

4. Instale a extensão **Live Server** no VS Code.
5. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

O site abrirá no navegador. As alterações guardadas no VS Code serão atualizadas automaticamente.

## Como adicionar as fotografias da oficina

### 1. Preparar os ficheiros

Escolha as fotografias reais da oficina e dê nomes simples, sem espaços nem acentos. Sugestões:

- `oficina-exterior.jpg` — fachada e entrada da oficina.
- `oficina-interior.jpg` — espaço de trabalho.
- `reparacao-automovel.jpg` — viatura em reparação.
- `equilibragem-pneus.jpg` — máquina de equilibragem.
- `revisao-oleo.jpg` — revisão, óleo e filtros.
- `equipa-oficina.jpg` — equipa, se houver autorização para publicar.

Pode criar uma pasta `assets/images/` na raiz do projeto e guardar as fotografias aí. Exemplo:

```
assets/
├── css/
│   └── styles.css
└── images/
    ├── oficina-exterior.jpg
    ├── oficina-interior.jpg
    ├── reparacao-automovel.jpg
    ├── equilibragem-pneus.jpg
    └── revisao-oleo.jpg
```

No VS Code: clique com o botão direito na pasta do projeto → **New Folder** → `assets/images`. Depois arraste as fotografias para essa pasta.

### 2. Trocar uma imagem no HTML

Abra `index.html` e procure pelo nome atual da imagem, por exemplo:

```html
<img src="mecanicageral.jpg" alt="Mecânico a trabalhar num motor">
```

Substitua apenas o valor de `src` pelo caminho da nova imagem:

```html
<img
  src="assets/images/reparacao-automovel.jpg"
  alt="Automóvel em reparação na oficina Auto Car"
  loading="lazy"
  decoding="async"
>
```

O caminho é relativo à localização do ficheiro `index.html`. Não use o caminho do seu computador, como `C:\\Users\\...\\foto.jpg`, porque esse caminho não funcionará quando o site estiver online.

### 3. Alterar a fotografia de fundo do início

A imagem principal do início (hero) está definida no CSS, não num elemento `<img>`. Abra `assets/css/styles.css`, procure por `.hero{` e localize `background:`. Troque apenas o endereço da imagem, mantendo o gradiente:

```css
.hero {
  /* mantenha as restantes propriedades existentes */
  background:
    linear-gradient(90deg, rgba(8,9,11,.88), rgba(8,9,11,.35)),
    url('../images/reparacao-automovel.jpg') center/cover;
}
```

Como o CSS está dentro de `assets/css/`, o caminho para a pasta `assets/images/` é `../images/nome-da-foto.jpg`.

### 4. Alterar a fotografia da secção “A oficina”

Procure em `index.html` a secção `id="sobre"`. Dentro dela, encontre a imagem com a classe `about-photo` e altere o `src` para, por exemplo:

```html
<img
  src="assets/images/oficina-interior.jpg"
  alt="Interior da oficina Auto Car Serviços Viseu"
  loading="lazy"
  decoding="async"
>
```

### 5. Cuidados importantes com as imagens

- Não altere nem redesenhe a logo original. Use o ficheiro original e confirme que o caminho no HTML corresponde exatamente ao nome do ficheiro (incluindo maiúsculas/minúsculas).
- Prefira fotografias reais, nítidas e bem iluminadas da própria oficina.
- Use imagens horizontais para o início e para cartões de serviços; fotografias verticais podem funcionar melhor numa galeria.
- Comprima as imagens antes de as adicionar. Como referência, tente manter cada imagem abaixo de 500 KB–800 KB, sem perder qualidade visível.
- Escreva um `alt` que descreva o que realmente aparece na fotografia.
- Não use imagens de clientes, matrículas ou pessoas identificáveis sem autorização.
- Evite imagens ilustrativas de bancos de imagens quando existir uma fotografia real do serviço correspondente.

## O que pode editar

| O que pretende alterar | Ficheiro / local |
|---|---|
| Títulos, textos, serviços e secções | `index.html` |
| Número de telefone e links WhatsApp | `index.html` — procurar `+351926388985` |
| Morada e mapa | `index.html` — procurar `3505-564` ou `maps.google.com` |
| Instagram | `index.html` — procurar `auto_car_viseu` |
| Fotografias dos cartões e secções | `index.html` — atributos `src` |
| Fotografia de fundo do início | `assets/css/styles.css` — regra `.hero` |
| Cores, tamanhos, espaçamentos e responsividade | `assets/css/styles.css` |
| Logo e favicon | `index.html` — procurar `logo.jpg` e `logo-autocar.jpg` |

## Agendamento pelo WhatsApp

O formulário não agenda automaticamente nem guarda dados numa base de dados. Ao submeter, o JavaScript prepara uma mensagem com os dados preenchidos e abre o WhatsApp através do link `wa.me`. O cliente ainda precisa de enviar a mensagem e a oficina deve confirmar a disponibilidade.

Antes de publicar, confirme que o número `+351 926 388 985` é o número correto do proprietário e que o formulário abre a conversa pretendida.

## Checklist antes de publicar

- [ ] Confirmar a logo original no cabeçalho e no rodapé.
- [ ] Adicionar as fotografias reais e verificar todos os caminhos.
- [ ] Confirmar telefone, WhatsApp, Instagram e morada.
- [ ] Testar todos os links e o formulário de agendamento.
- [ ] Verificar o mapa e a localização.
- [ ] Testar em ecrãs pequenos e grandes.
- [ ] Rever textos, ortografia e informações comerciais.
- [ ] Confirmar autorização para publicar todas as imagens.
- [ ] Só depois de aprovado, integrar as alterações na branch principal e publicar.

---

**Nota:** este README descreve a estrutura e os comportamentos previstos no código desta branch. Confirme sempre os caminhos dos ficheiros existentes no GitHub antes de os substituir.
