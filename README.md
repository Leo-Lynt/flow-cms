# Flow Forge - Sistema de Transformação de Dados Visual

Uma aplicação de transformação de dados com programação visual estilo blueprint, similar à Unreal Engine.

## 🚀 Funcionalidades

- **Nó Connector**: Captura dados de APIs ou Analytics (mock)
- **Nós Matemáticos**: Operações de soma, subtração, multiplicação e divisão
- **Nó Output**: Visualização do resultado final
- **Sistema Visual**: Arraste, solte e conecte nós visualmente
- **Execução em Tempo Real**: Execute o fluxo e veja os resultados instantaneamente

## 📋 Como Usar

1. **Iniciar o projeto**:
```bash
npm install
npm run dev
```

2. **Adicionar Nós**:
   - Clique nos botões superiores para adicionar diferentes tipos de nós
   - **Connector**: Fonte de dados (API ou Analytics)
   - **Add/Subtract/Multiply/Divide**: Operações matemáticas
   - **Output**: Visualização do resultado

3. **Conectar Nós**:
   - Arraste de uma saída (ponto à direita) para uma entrada (ponto à esquerda)
   - Nós matemáticos têm duas entradas (A e B) e uma saída
   - Connectors têm apenas saída
   - Outputs têm apenas entrada

4. **Configurar Dados**:
   - **Connector com Analytics**: Digite um valor mock
   - **Connector com API**: Digite a URL da API e o caminho dos dados (opcional)

5. **Executar**:
   - Clique no botão "▶ Execute" para processar o fluxo
   - Os resultados aparecerão em cada nó

## 🎯 Exemplo de Uso

1. Adicione 2 Connectors com valores 10 e 20
2. Adicione um nó de Multiplicação
3. Conecte os Connectors às entradas A e B do nó de multiplicação
4. Adicione um Output e conecte à saída da multiplicação
5. Execute o fluxo - o resultado será 200

## 🛠️ Tecnologias

- Vue 3
- Vue Flow (biblioteca de blueprint)
- Pinia (gerenciamento de estado)
- Tailwind CSS
- Vite

## 📝 Estrutura do Projeto

```
src/
├── components/
│   ├── FlowCanvas.vue       # Canvas principal
│   └── nodes/
│       ├── ConnectorNode.vue # Nó de entrada de dados
│       ├── MathNode.vue      # Nós matemáticos
│       └── OutputNode.vue    # Nó de saída
├── stores/
│   └── flowStore.js          # Lógica de execução e estado
└── types/
    └── node.types.js         # Tipos de nós
```
# flow-cms
# flow-cms
