/* Dados do sistema JoJo Bizarre Adventure: O Mundo dos Stands (v7.0) */
var JJ={};
JJ.VER=2;
JJ.AT=["Força","Destreza","Constituição","Inteligência","Sabedoria","Carisma"];
JJ.GR=["E","D","C","B","A"];
JJ.MOD=[-1,0,1,3,4];            // Tabela 1.1
JJ.COST=[-1,0,1,2,3];           // Tabela 1.2 (E devolve 1 ponto)
JJ.PAT=["Iniciante","Intermediário","Veterano"];
JJ.TREIN=[3,6,9];               // bônus de treinamento
JJ.LIMPE=[4,8,12];              // limite de PE por turno
JJ.NIVMAX=[2,3,4];              // nível máximo de habilidade
JJ.PE=[1,3,6,10];               // Tabela 2.6 (custo em PE por nível)
JJ.ABIL_PS=[1,2,3,4];           // custo em PS por nível de habilidade (ajuste aqui se sua mesa usar outro)
// Tabelas de Stand (índice 0..4 = E..A)
JJ.DANO=["0","1d4","1d6","1d8","1d10"];
JJ.VEL_B=[-1,0,2,3,5];JJ.VEL_D=["0m","9m","10,5m","12m","13,5m"];JJ.VEL_A=["Padrão","Padrão","Bônus","Bônus","Livre"];
JJ.RD=["","","1d4","1d6","1d10"];JJ.CONC=[-1,0,2,3,5];
JJ.PRE_B=[-1,0,2,3,5];JJ.PRE_D=["9m","15m","30m","90m","180m"];
JJ.ALC_S=["0m","9m","15m","22,5m","30m"];JJ.ALC_H=["9m","15m","22,5m","75m","90m"];
JJ.ALC_REQ={"Pessoal":0,"Toque":0,"Curto":0,"Médio":1,"Longo":3,"Extremamente Longo":4,"Infinito":4};
// Perícias: [nome, atributo-chave, somente treinada, penalidade de armadura]
JJ.SKILLS=[["Acrobacia",1,0,1],["Artes",5,1,0],["Atletismo",0,0,0],["Conhecimento",3,0,0],["Crime",1,1,0],["Fortitude",2,0,0],["Furtividade",1,0,1],["Influência",5,0,0],["Lidar com Animais",4,1,0],["Mecânica",3,1,0],["Medicina",4,0,0],["Pilotagem",1,1,0],["Sentidos",4,0,0],["Sobrevivência",4,0,0],["Reflexos",1,0,0],["Vontade",4,0,0]];
// Ocupações: [nome, perícias, nº de perícias extras à escolha, característica, texto]
JJ.OCC=[
["Agente Secreto",["Crime","Conhecimento"],0,"Banco de Dados","Com computador e internet, teste de Inteligência (Investigação) DT 17 para obter informação de um NPC/personagem. Se falhar ou ele não estiver no banco, passe 4h com o alvo para +3 no teste."],
["Amnésio",[],2,"Reconstrução de Memória","1x por sessão, teste de Inteligência (DT 12) para reconhecer lugares ou pessoas. Ganha 1d6 de PE temporário e, a critério do mestre, uma informação importante. (Perícias: duas à escolha do mestre.)"],
["Atleta",["Atletismo","Fortitude"],0,"Fôlego Infinito","Em testes de Força, Destreza ou Constituição (exceto ataque e dano), gaste 2 PE para ganhar +3."],
["Chef",["Artes","Sobrevivência"],0,"Bon appétit","Ao fazer descanso curto ou longo, teste de Inteligência (Mecânica) DT 10 para fazer uma refeição: cada um ganha 1d8 de PE temporário até o fim do próximo combate."],
["Cientista",["Conhecimento","Vontade"],0,"O poder do Saber","1x por cena, troque o atributo de um teste por Inteligência."],
["Colegial",["Conhecimento"],1,"Eu vi isso num livro","1x por cena, teste de Inteligência (DT 12) para lembrar de um assunto ensinado na escola. (Segunda perícia: ligada à sua matéria favorita.)"],
["Criminoso",["Crime","Sobrevivência"],0,"O crime compensa","Vantagem em testes para furtar, arrombar fechaduras e cometer crimes estando furtivo."],
["Engenheiro",["Mecânica","Conhecimento"],0,"Conhecimento em Construção","1x por cena, em um teste de Mecânica, diminua um recurso necessário para construir um equipamento."],
["Gângster",["Crime","Influência"],0,"O Diplomata","1x por sessão, teste de Carisma (DT 12) para ter vantagem em Diplomacia contra uma pessoa escolhida."],
["Herói",["Influência","Atletismo"],0,"Recuperar o Fôlego","Em combate, recupere 1d6 de Vigor. Só pode usar de novo após um descanso curto ou longo."],
["Jockey",["Lidar com Animais","Pilotagem"],0,"Cavalo Treinado","Possui um cavalo pessoal que pode chamar em qualquer área onde dê para cavalgar. Vantagem em ataques feitos montado."],
["Mercenário",["Influência","Conhecimento"],0,"Movimentação Tática","Gaste 2 PE antes de rolar iniciativa para ter vantagem no teste."],
["Militar",["Sentidos","Conhecimento"],0,"Letalidade","Gaste 2 PE antes de atacar: o ataque reduz a CA do inimigo em −2. Só 2x por cena."],
["Policial",["Sentidos","Influência"],0,"Oficial da Lei","Use o distintivo para entrar em lugares privados (nem sempre funciona) e possua armas."],
["Político",["Influência","Crime"],0,"O Poder dos Contatinhos","1x por aventura, ative sua rede de contatos para pedir um favor (equipamento, abrigo, resgate...). O mestre decide."],
["Prisioneiro",["Crime","Influência"],0,"Conhecimento Criminoso","Vantagem de +3 em testes de arrombar portas, furtar etc. (veja Crime)."],
["Religioso",["Conhecimento","Vontade"],0,"Devoto","Ao testar seguindo sua devoção, gaste 2 PE para ter vantagem na rolagem. Só 2x por cena."],
["Trambiqueiro",["Crime","Influência"],0,"Malandragem","1x por cena, gaste 2 PE para trocar um teste de perícia por Carisma (Enganação), exceto testes físicos."],
["Viajante",["Sentidos","Sobrevivência"],0,"Eu conheci esse lugar","Ao entrar num ambiente desconhecido, teste de Inteligência (DT 12) para lembrar informações sobre o lugar, a cultura e as pessoas."]
];
// Poderes: [nome, texto do pré-requisito, [[OU de [tipo,índice,nota mínima]]...], descrição, exige Criar Ilusões, repetível]
// tipo "at" = atributo do personagem (0 FOR,1 DES,2 CON,3 INT,4 SAB,5 CAR); "st" = atributo do Stand (0 Poder,1 Durab.,2 Veloc.,3 Prec.,4 Alcance,5 Pot.); nota 0..4 = E..A
JJ.POW=[
["Stand Automático","INT C+",[[["at",3,2]]],"Transforma uma habilidade em automática, com um gatilho definido. Gasta PE automaticamente; sem PE, não ativa.",0,0],
["Treinamento em Perícia","—",[],"Ganha uma perícia nova à escolha. Pode ser escolhido um nº de vezes igual ao modificador de Inteligência.",0,1],
["Controle de Colisão","Durabilidade C+",[[["st",1,2]]],"Ignora a desvantagem de stands não atravessarem estruturas: você decide quando o stand atravessa.",0,0],
["Reconhecimento Ampliado","SAB C+",[[["at",4,2]]],"Stand mais sensível a movimentos: vantagem em testes de reconhecimento.",0,0],
["Cura Rápida","CON B+",[[["at",2,3]]],"Recupera 1d10 + mod. de Constituição de Vigor ao fim dos combates.",0,0],
["Telepatia","SAB B+",[[["at",4,3]]],"Passa informações e se comunica telepaticamente com outras pessoas.",0,0],
["Intangibilidade","Durabilidade A",[[["st",1,4]]],"O stand ativa uma habilidade que o deixa imune a ataques físicos até seu próximo turno (1x por descanso longo; o stand não age nesse tempo).",0,0],
["Ressurreição Temporária","CON A",[[["at",2,4]]],"Ao ter 3 falhas nos testes contra a morte, no seu próximo turno você se reanima por 1 round com metade da vida; depois morre sem teste.",0,0],
["Mimetismo Camaleônico","INT B+ e habilidade de Ilusão",[[["at",3,3]]],"Sua habilidade de ilusão pode dar camuflagem durante a duração.",1,0],
["Vôo","(Velocidade ou DES A) e Alcance A",[[["st",2,4],["at",1,4]],[["st",4,4]]],"Você ganha deslocamento de voo (metade do de caminhada) e pode alternar entre os dois.",0,0],
["Presença Misteriosa","CAR A",[[["at",5,4]]],"Ao entrar numa sala (ou alguém entrar), os presentes testam Vontade DT 10 + (mod. CAR × 2); quem falhar dá a você +5 em Enganação, Intimidação e Diplomacia contra ele.",0,0],
["Ataque Veloz","Velocidade C+",[[["st",2,2]]],"Seus ataques com Destreza ou Velocidade impõem −2 na CA do inimigo.",0,0],
["Mobilidade Fora do Normal","DES B+",[[["at",1,3]]],"+5 em Atletismo e Acrobacia e triplo do deslocamento ao correr em disparada.",0,0],
["Quebra Ossos","FOR B+ ou Poder B+",[[["at",0,3],["st",0,3]]],"1x por combate, num ataque corpo a corpo, role o dano de novo e escolha um dos valores.",0,0],
["Ameaçador","CAR B+",[[["at",5,3]]],"Ao passar em Intimidação (DT 13 + mod. CAR), ganha +5 nas rolagens de dano.",0,0],
["Cão de Caça","SAB A",[[["at",4,4]]],"+3 em testes de Investigação para rastrear inimigos.",0,0]
];
// Habilidades: [nome, nível, tipo, ação, alcance, duração, alvo, resistência, descrição]
JJ.HAB=[
["Amolecer",1,"Transmutar","Padrão","Toque","Concentrada","Objeto","—","Deixa um objeto macio e elástico como borracha: fica indestrutível e moldável."],
["Arma Especial",1,"Invocar","Movimento","Pessoal","Concentrada","—","Fortitude reduz metade","Invoca uma arma predefinida com 1 característica: Ataques Pesados (+1d de dano), Projéteis Teleguiados (−5 de dano a cada 9m) ou Explosão (3d6+3 de Energia)."],
["Causar Raiva",1,"Aprimorar","Padrão","Médio","Cena","Até 10 seres","Vontade anula","Seres em fúria: sem concentração, +5 em ataque e dano, resistência 5 a dano físico e precisam atacar alguém no turno."],
["Clarividência",1,"Manipular","Padrão","Toque","Instantânea","Objeto que gere imagem","—","Gera na imagem do objeto qualquer informação que você queira ver (o mestre decide)."],
["Copiar Aparência",1,"Transmutar","Padrão","—","Concentrada","1 pessoa","—","O stand copia rosto, roupas e detalhes de uma pessoa, sem ganhar seus atributos ou habilidades."],
["Criar Ilusões",1,"Manipular","Padrão","Médio","Cena","—","Vontade anula","Cria ilusões visuais e sonoras, simples ou complexas. Quem interage ou passa na resistência percebe que é falsa."],
["Criar Quarto",1,"Manipular","Padrão","—","Concentrada","—","—","Cria um quarto próprio com móveis e equipamentos definidos na escolha (o mestre valida)."],
["Curar",1,"Manipular","Padrão","Toque","Instantânea","1 ser","—","Recupera 3d6+3 de Vigor de um ser, ou conserta objetos e estruturas."],
["Extensão Corporal",1,"Transmutar","Movimento","Longo","Instantânea","—","—","O stand estica a longo alcance sem se afastar do usuário, mas fica desprevenido fora da frente."],
["Força Conjunta",1,"Aprimorar","Padrão","—","Concentrada","—","—","Exclusiva de stand colônia. Libera: Flanquear, Segurar, Atrapalhar (−5 em perícias), Ataque Conjunto (+1d10) e Múltiplos Ataques (até 5 alvos, −1d20 por extra)."],
["Informação",1,"Aprimorar","Padrão","Longo","Instantânea","—","—","+5 em Percepção, Investigação, Tática ou Sobrevivência para buscar informação."],
["Invisibilidade",1,"Transmutar","Padrão","Pessoal","Cena ou até atacar/ser atacado","Você e o stand","—","Ataques contra você têm desvantagem, +15 em Furtividade e vantagem em ataques contra quem não te vê."],
["Manipulação da Areia",1,"Manipular","Padrão","Médio","Cena","—","Fortitude parcial","Modelar, Sufocar (2d6 e atordoa), Endurecer (agarra) e Amolecer (8d8 de impacto, Reflexos reduz metade)."],
["Manipulação da Eletricidade",1,"Manipular","Padrão","Curto","Instantânea","1 ser ou objeto","Fortitude parcial","Sobrecarregar aparelhos ou Descarga Elétrica (3d6 de dano Elétrico e Vulnerável)."],
["Manipulação do Fogo",1,"Manipular","Padrão","Curto","Instantânea","1 ser","Reflexos reduz metade","Moldar (3d6 de Fogo), Ampliar (3d6, até 6m), Transferir (+2d6 de Fogo em arma) e Esquentar (2d6)."],
["Manipulação do Gelo",1,"Manipular","Padrão","Médio","Instantânea","1 ser ou objeto","Fortitude parcial","Estacas de Gelo (2d10 de Frio e Vulnerável) ou Congelar um ser pelo toque."],
["Manipular Cabelos",1,"Manipular","Padrão","Médio","Instantânea","1 ser ou objeto","Reflexos parcial","Bater (2d8+FOR), Agarrar, Sufocar (2d10+FOR num agarrado) e Segurar um objeto."],
["Melhorar",1,"Aprimorar","Padrão","Pessoal","Cena","—","—","+1d20 em testes de Ataque, Atletismo, Acrobacia, Fortitude e Reflexos."],
["Mudar Aparência",1,"Transmutar","Padrão","Pessoal","Cena","Você","—","Assume a aparência de alguém que já viu; +10 em Influência para disfarce."],
["Prender",1,"Aprisionar","Padrão","Curto","1 rodada","1 ser","Fortitude evita","Prende o alvo com uma estrutura à sua escolha, deixando-o Imobilizado."],
["Rebobinar",1,"Manipular","Completa","—","Instantânea","Stand","—","Recria um evento passado que você conhece; o stand fica vulnerável enquanto recria."],
["Técnicas de Batalha",1,"Aprimorar","Padrão","Pessoal","—","—","Veja o texto","Libera: Ataque de Finta, Contra-Ataque (+4 no dano), Empurrar, Derrubar, Grito (atordoa, Vontade anula) e Surto de Adrenalina (+4 em ataque/dano e 1d10 de PE temp., 3x por combate)."],
["Transmutação",1,"Transmutar","Padrão","Pessoal","Cena","Stand","—","O stand vira qualquer objeto que caiba na mão; se for arma, soma o Poder do stand ao dano."],
["Abrir",2,"Transmutar","Padrão","Toque","Concentrada","1 objeto","—","Abre passagens em objetos (porta numa parede, alçapão no chão)."],
["Atravessar Objetos",2,"Transmutar","Padrão","Pessoal","Instantânea","—","—","Você e o stand ficam intangíveis para atravessar obstáculos enquanto estiverem em contato."],
["Cadeia",2,"Aprisionar","Padrão","Curto","1 rodada","Até 3 seres (cubo 3x3)","Fortitude evita","Prende os alvos; se não saírem antes do fim, ficam Vulneráveis."],
["Dar Vida",2,"Manipular","Padrão","Toque","Concentrada","1 objeto","—","Dá vida e consciência a um objeto, leal a você. Volta ao normal quando a habilidade acaba."],
["Decompor",2,"Transmutar","Padrão","Pessoal","Concentrada","Pessoal","—","Decompõe o corpo em pedaços: imune a ataques, mas deslocamento pela metade."],
["Diminuir",2,"Transmutar","Padrão","Toque","Cena","1 ser","Fortitude parcial","Reduz o tamanho do alvo em uma escala."],
["Duplicar",2,"Manipular","Padrão","Toque","Concentrada","1 objeto","—","Duplica um objeto; ao acabar, as cópias se juntam violentamente e podem causar dano."],
["Espinhos",2,"Invocar","Reação","Pessoal","Instantânea","—","Fortitude reduz metade","Ao sofrer um ataque, evita e devolve metade do dano ao atacante."],
["Gravidade Zero",2,"Manipular","Padrão","Médio","Cena","Todos na área (esfera 18m)","—","Seres na área voam, ataques corpo a corpo têm desvantagem, armas de alcance reduzem para 6m/18m e todos (menos você) ficam desprevenidos."],
["Magnetismo",2,"Manipular","Padrão","Toque","Instantânea","1 ser ou objeto (círculo 18m)","Fortitude reduz metade","Atrai objetos (>1kg) da área até o alvo: 1d6 de dano por objeto."],
["Manipulação da Água",2,"Manipular","Padrão","Médio","Instantânea","1 ser","Veja o texto","Projétil de Água (3d6), Afogar (Sufocado), Molhar, Evaporar (2d10 em área) e Encharcar (terreno difícil 12m)."],
["Manipular Carne",2,"Manipular","Padrão","Curto","Instantânea","1 ser","Fortitude parcial","2d10+4 de dano de sangue e Sangramento."],
["Manipular Cinética",2,"Manipular","Padrão","Toque","Concentrada","1 objeto","—","Congela a cinética de um objeto no lugar; criatividade é o limite."],
["Manipular Memórias",2,"Manipular","Padrão","Toque","Instantânea","1 pessoa","Vontade anula","Apaga memórias recentes por pouco tempo ou altera aspectos de um evento por 1d4 horas."],
["Manipular Metal",2,"Manipular","Padrão","Curto","Instantânea","1 ser","Veja o texto","Projétil (2d8+Poder, Perfuração), Derreter (2d10+5 de Fogo), Moldar e Controlar metal (3m por turno)."],
["Manipular Pessoa",2,"Manipular","Padrão","Curto","1 rodada","1 pessoa","Vontade anula","+10 em Influência para persuadir, enganar e manipular o alvo."],
["Mutar Forma",2,"Transmutar","Padrão","Pessoal","Cena","Você","—","Transforma você em qualquer ser ou objeto, ganhando suas capacidades (objeto: deslocamento 0m)."],
["Parasitar",2,"Aprisionar","Padrão","Longo","Cena","1 pessoa","Fortitude parcial","O stand causa uma enfermidade: Sangramento, Envenenamento (1d6+1) ou Queimar (2d6+2). O efeito é escolhido na criação."],
["Possessão",2,"Transmutar","Padrão","Toque","Concentrada","1 objeto","—","O stand possui e controla um objeto; não compartilha dano até o objeto ser destruído."],
["Proteger",2,"—","—","—","—","—","—","Sem descrição no livro v7.0 — combine com o mestre."],
["Teletransporte",2,"—","—","—","—","—","—","Sem descrição no livro v7.0 — combine com o mestre."],
["Transformar",2,"—","—","—","—","—","—","Sem descrição no livro v7.0 — combine com o mestre."],
["Apagar",3,"Manipular","Padrão","Toque","Instantânea","1 pessoa ou objeto","Fortitude reduz metade","3d10+5 de dano de Energia, apagando parte da existência do alvo."],
["Criar Dimensão",3,"Invocar","Padrão","Toque","Instantânea","—","—","Cria uma dimensão onde só você e o stand afetam objetos; pode levar pessoas (sem stands)."],
["Criar Gás",3,"Invocar","Padrão","Curto","Instantânea","Gás de 9m de raio","Fortitude parcial","2d10+4 de dano Químico e uma condição à escolha (Confuso, Enjoado, Envenenado, Ofuscado ou Vulnerável) por 2 rodadas."],
["Evoluir",3,"Aprimorar","Completa","Pessoal","Cena","—","—","Aprende uma técnica adicional durante o combate (1x por combate; perde no fim da cena)."],
["Manipulação de Pensamentos",3,"Manipular","Padrão","Curto","Cena","1 pessoa","Vontade anula","Dá uma ordem ao alvo (nunca para se ferir). Se resistir, fica imune até o fim da cena."],
["Manipular Composição",3,"Manipular","Padrão","Toque","Instantânea","1 objeto","—","Troca a base molecular de um sólido mantendo a forma (madeira → metal). Funciona por técnicas."],
["Manipular Corpo",3,"Manipular","Padrão","Toque","Cena","1 ser morto","—","Controla corpos de seres mortos como aliados até o fim da cena (até 4, voltam com metade do Vigor e sem habilidades)."],
["Manipular Gravidade",3,"Manipular","Padrão","Curto","1 rodada","1 ser ou objeto","—","Muda a direção da gravidade de um alvo."],
["Manipular Sorte",3,"Manipular","Reação","Curto","Instantânea","1 pessoa","Vontade parcial","Retirar Sorte (−5 no teste do alvo; acumula até 3 cargas por 2 PE) ou Dar Sorte (+5 gastando 1 carga)."],
["Roubar Atributo",3,"Aprimorar","Padrão","Curto","Cena","1 ser","Fortitude anula","O alvo perde 1 nota em um atributo e você ganha 1 (máx. A)."],
["Avançar o Tempo",4,"Manipular","Completa","Infinito","Concentrada","—","—","Acelera o fluxo do tempo no universo (seres vivos não são afetados). Consulte o mestre."],
["Manipulação de Almas",4,"Manipular","Completa","Longo","Cena","Todos na área (esfera 45m)","Vontade anula","Troca as almas (e corpos) de seres na área."],
["Manipular Clima",4,"—","—","—","—","—","—","Sem descrição no livro v7.0 — combine com o mestre."],
["Manipular Destino",4,"Manipular","Completa","Curto","Instantânea","1 ser","—","Dá vantagem a você ou desvantagem a um inimigo conforme o destino. O mestre tem a palavra final."],
["Manipular Dimensões",4,"Manipular","Completa","Curto","Instantânea","—","—","Faz dimensões paralelas coexistirem: visitar, trazer objetos/seres ou se esconder (10d8 explosivo se duplicatas se encontrarem)."],
["Parar o Tempo",4,"Manipular","Completa","Infinito","Instantânea","—","—","2 rodadas: registra as posições e depois controla a cena por 1 rodada."],
["Pular o Tempo",4,"Manipular","Completa","Infinito","Instantânea","—","—","2 rodadas: durante o efeito você é imune a ataques e pode se posicionar em qualquer lugar da cena."],
["Voltar no Tempo",4,"Manipular","Completa","Infinito","Instantânea","—","—","2 rodadas: os seres voltam às posições registradas e as ações dessas rodadas são desfeitas."]
];
JJ.HABMAP={};
JJ.HAB.forEach(function(a){JJ.HABMAP[a[0]]={n:a[0],l:a[1],t:a[2],a:a[3],r:a[4],du:a[5],al:a[6],rs:a[7],d:a[8]}});