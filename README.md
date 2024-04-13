<h2 align="center"> Discord.js v14 Bot Template (TypeScript) </h2>

This is a template for creating a Discord.js v14 bot using TypeScript. It provides a basic structure and setup to help you get started quickly.
Support new **User Apps**.

<p align="center"> <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white"/> </p>

## Installation

To run the bot, follow these steps:

1. Clone this repository:
    ```
    git clone https://github.com/imnaiyar/djs-v14-typescript-template
    ```
2. Install the dependencies by running `npm i`.

## Running the Project

- To build the project, run: `npm run build`.
- Rename `example.env` to `.env` and fill out the token, optionally provide discord's webhook urls for additional logs.
- Start the project by running `npm start`.

### Adding User Apps Commands
You need to include these two properties in the `data` property of the command: `integration_types` and `contexts`. 
```js
export default <SlashCommand> {
data: {
..., // other properties
integration_types: [0, 1],
contexts: [0, 1, 2],
},
...// other properties
}
```
These determine what type of command it is and where it can be accessed from.
Two enums `IntegrationTypes` and `ContextTypes` are available to help you with this.