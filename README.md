# CLI utility for creating and managing development workspace

This repository contains the source code for the CLI utility to initialize
and manage a development workspace.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Usage](#usage)
- [Commands](#commands)
  - [`init` command](#init-command)
  - [`run` command](#run-command)
  - [`sync` command](#sync-command)
  - [`help` command](#help-command)
- [Workspace structure](#workspace-structure)
  - [Repository configuration](#repository-configuration)
  - [Server configuration](#server-configuration)
  - [Secret templates](#secret-templates)
- [Use cases](#use-cases)
  - [Available use cases](#available-use-cases)
  - [Creating use cases](#creating-use-cases)
- [Template repository](#template-repository)
- [Development](#development)
  - [Testing](#testing)

## Prerequisites

The CLI utility is based on Node.js and NPM. To install the utility, it is
necessary to have Node.js and NPM installed.

## Usage

The CLI utility can be executed via `npx`:

```bash
npx @cycrilabs/ws-ctrl@latest
```

This will pull the latest version of the utility from the NPM registry and execute
it. The utility will then display the available commands and options.

## Commands

A command is executed by appending it to the initial `npx`, for example for the
`init` command:

```bash
npx @cycrilabs/ws-ctrl@latest init
```

The following table lists all available commands and options.

| Command | Description                              |
| ------- | ---------------------------------------- |
| `init`  | Initialize a new workspace               |
| `run`   | Run a specific use case in the workspace |
| `sync`  | Syncs the templates                      |
| `help`  | Displays help information                |

### `init` command

The `init` command initializes a new workspace. After executing the command, the
user is prompted to enter at least to location of new workspace. Alternatively,
the location can be passed as an argument directly, e.g.

```bash
npx @cycrilabs/ws-ctrl@latest init ./platform
```

In addition, the user is prompted to specify whether a template repository should
be used, and if so, which one.

Furthermore, the following options are available:

| Option                                         | Description                           |
| ---------------------------------------------- | ------------------------------------- |
| `--templates-repository <templatesRepository>` | use the specified template repository |

The template repository is a Git repository that contains the templates for the
workspace. If no template repository is specified, provided templates from the
CLI utility package are used.

For more details, see the [Workspace structure](#workspace-structure)
and [Template repository](#template-repository) sections.

### `run` command

The `run` command executes a specific use case in the workspace. Use cases can
only be executed if the workspace has been initialized before and only within
the top-level workspace directory.

The following options are available:

| Option                      | Description                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `-u, --use-case [use-case]` | the use case to run                                                                                 |
| `--debug`                   | enable debug mode; allows to run use cases from any location, assuming the config structure matches |

For example, to run the `check-requirements` use case, execute:

```bash
npx @cycrilabs/ws-ctrl@latest run -u check-requirements
```

For more details, see the [Use cases](#use-cases) section.

### `sync` command

The `sync` command syncs the templates. This command is used to update the
templates in the workspace. Templates are copied from the CLI utility package
itself and, if a template repository is used, from the template repository.

The command is executed via:

```bash
npx @cycrilabs/ws-ctrl@latest sync
```

For more details, see the [Template repository](#template-repository) section.

### `help` command

The `help` command displays help information. It can be executed via:

```bash
npx @cycrilabs/ws-ctrl@latest help
```

## Workspace structure

The workspace is structured as follows, assuming the workspace is located in
`./platform` and a template repository is used:

```
├── platform
│   ├── config
│   │   ├── development
│   |   |    ├── ...
│   │   ├── docker
│   |   |    ├── ...
│   │   ├── git-templates
│   |   |    ├── ...
│   │   ├── repositories
│   |   |    ├── ...
│   │   ├── secret-templates
│   |   |    ├── ...
│   │   ├── servers
│   |   |    ├── ...
│   │   ├── services-config
│   |   |    ├── ...
│   │   ├── use-cases
│   |   |    ├── ...
│   │   ├── cli.sh
│   ├── development
│   |   ├── ...
│   ├── adbb1a3d55.json
│   ├── cli.sh
```

The following table lists the directories and files in the workspace and their
purpose:

| Directory/File            | Purpose                                                                                                                                                         |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `config`                  | configuration files for the workspace; all files in here are the basis for the workspace                                                                        |
| `config/development`      | development files for the workspace; this directory is copied to the root directory and will contain all cloned repositories as well as IDE configuration files |
| `config/docker`           | Docker configuration files for the workspace; the files are copied to the root directory and will be used to start services                                     |
| `config/git-templates`    | Git template repository; contains the cloned template repository, if configured; all files from it will be copied over recursively to the `config` directory    |
| `config/repositories`     | repository configuration files for the workspace; see [Repository Configuration](#repository-configuration)                                                     |
| `config/secret-templates` | secret templates for the workspace; see [Secret Templates](#secret-templates)                                                                                   |
| `config/servers`          | server configuration files for the workspace; see [Server Configuration](#server-configuration)                                                                 |
| `config/services-config`  | service configuration files for the workspace; the file are automatically generated by the use case `generate-service-configuration`                            |
| `config/use-cases`        | use case configuration files for the workspace; see [Use Cases](#use-cases)                                                                                     |

### Repository configuration

The repository configuration files are used to configure the repositories
that can be cloned into the workspace. The configuration files are located in
the `config/repositories` directory. All files are automatically available for
prompts.

This [JSON Schema](https://raw.githubusercontent.com/CycriLabs/ws-ctrl/refs/heads/main/schemas/repository.schema.json) defines the structure of the repository configuration.

### Server configuration

The server configuration files are used to configure the servers that can be
used to run the platform against. The configuration files are located in the
`config/servers` directory. All files are automatically available for prompts.

This [JSON Schema](https://raw.githubusercontent.com/CycriLabs/ws-ctrl/refs/heads/main/schemas/server.schema.json) defines the structure of the server configuration.

### Secret templates

The secret templates are used to provide the secrets that are necessary for all services
running locally to connect to Keycloak or other services. In addition,
they can contain environment variables specific to each service. The secret templates
are located in the `config/secret-templates` directory.

The secret templates are based on the [Keycloak Configurator](https://github.com/CycriLabs/keycloak-configurator).
For more details, check the [documentation](https://github.com/CycriLabs/keycloak-configurator?tab=readme-ov-file#sub-command-export-secrets).

If secret templates are the input for the `generate-service-configuration` executor,
then, the [Keycloak Configurator](https://github.com/CycriLabs/keycloak-configurator) gets
the `.env` file as input as well as additionally the following variables:

- `KCC_WORKSPACE_PATH`: The absolute path to the workspace directory.
- `KCC_WORKING_DIR`: The absolute path to the working directory.

## Use cases

Use cases are scripts based on JSON that can be executed in the workspace. They
are located in the `config/use-cases` directory. Use cases can be executed via
the `run` command.

Use cases provide a special syntax to define the steps that are executed in
order to modify the configuration of a workspace, execute commands, or perform
other tasks.

In the following, available use cases are listed and it is described how to
create new use cases.

### Available use cases

The following use cases are available out of the box and provided by the CLI
utility package:

| Use case name        | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `check-requirements` | Checks the requirements for the workspace                       |
| `clone-repositories` | Clones selected repositories into the workspace                 |
| `list-containers`    | Lists all running docker containers in the workspace            |
| `pull-repositories`  | Pulls the latest changes from the repositories in the workspace |

The use cases are available by default and can be disabled via a template
repository.

In addition, there are two use cases that are executed right after the commands
`init` and `sync` are executed:

| Use case name | Description                                                                                         |
| ------------- | --------------------------------------------------------------------------------------------------- |
| `init`        | Executed directly after the `init` command did it's hard-coded work; only executed once on creation |
| `sync`        | Executed directly after the `sync` command did it's hard-coded work; executed after every sync      |

These use cases have the state `HIDDEN` (see [Creating use cases](#creating-use-cases))
and are not displayed in the list of available use cases. They can't be executed
directly. However, via template repositories, it is possible to overwrite these
use cases and easily extend what should be done after the `init` or `sync`
command per project basis.

### Creating use cases

Although there are a lot of use cases available, it is possible to create new
use cases. Use cases are simply JSON files that expect some specific structure
and keywords to be correctly interpreted by the CLI utility. Like this, it is
possible to easily configure and execute pretty much everything on the workspace
configuration files.

This [JSON schema](https://raw.githubusercontent.com/CycriLabs/ws-ctrl/refs/heads/main/schemas/use-case.schema.json) describes the structure of a use case. In the following, each
keyword is described and potential end-2-end usage examples are provided.

A use case consists of the follow properties:

- `id`: a unique identifier for the use case; can be used to reference the use case or call it via the `-u` option
- `name`: the name of the use case; mainly used for display purposes
- `description` (optional): a description of the use case; mainly used for display purposes
- `state` (optional): the state of the use case; can be one of the following
  - `ENABLED`: the use case is generally usable; this is the default state
  - `DISABLED`: the use case is not usable at all
  - `INITIAL`: the use case is only usable with commands
  - `HIDDEN`: the use case is only callable by `id`, either by `-u` or via reference from another use case
- `steps`: an array of steps that are executed in order

Each step consists of the following properties:

- `type`: the type of the step; can be one of the following
  - `FORMULA`: a JavaScript formula that is executed in this step; executed via `eval`
  - `COMMAND`: execute a command; the command is executed via NodeJS `child_process.execSync`; if used in combination with `resultVariable` command output is captured
  - `EXECUTOR`: a special step that is connected to some build-in executor; see [Available executors](#available-executors)
  - `USE_CASE`: call another use case
  - `PROMPT`: trigger a prompt for user input
- `description` (optional): a description of the step; mainly used for display purposes
- `loop` (optional): a loop that is executed for each element in the array; the loop is an object with the following properties
  - `list`: the array that is looped over
  - `name`: the variable that is used in the loop
- `inputFile` (optional): the input file for the step; the file is read and the content is passed to the step; can be used to write back content
- `outputFile` (optional): the output file for the command; the output of the step is written to the file
- `abortIf` (optional): a formula that is evaluated; if the formula is true, the use case is stopped
- `skipIf` (optional): a formula that is evaluated; if the formula is true, the step is skipped
- `catchErrors` (optional): a flag to catch errors; if set to `true`, errors are caught and the use case is not stopped; defaults to `false`
- `useCase` (optional): the use case that is called; only used for `USE_CASE` steps
- `formula` (optional): the formula that is executed; only used for `FORMULA` steps; a JavaScript formula that is executed in this step; executed via `eval`
- `command` (optional): the command that is executed; only used for `COMMAND` steps; the command is executed via NodeJS `child_process.execSync`
- `executor` (optional): the executor that is used; only used for `EXECUTOR` steps; see [Available executors](#available-executors)
- `resultVariable` (optional): the variable that is used to store the result of the step; the variable is available in the next steps; if not provided, results are stored as `STEP_RESULT`
- `context` (optional): the context that is used for the step; the context is an object that is passed to the step; can be used to store variables

#### Available executors

The following executors are available:

- `custom-prompt`: trigger a custom prompt on the CLI; the following context is expected:
  - `name`: the name of the variable that is used to store the result of the prompt
  - `message`: the message that is displayed to the user
  - `type`: the type of the prompt; can be one of the following (see [prompts](https://github.com/terkelg/prompts?tab=readme-ov-file#-types))
    - `text`: a simple text input
    - `number`: a simple number input
    - `confirm`: a yes or no questions
    - `select`: a single select prompt
    - `multiselect`: a multi select prompt
  - `entities`: the entities that are used for the select or multiselect prompt
  - `entityKey`: a key that is used to display entities from the context
- `generate-service-configuration`: generates .env files for services based on [Keycloak Configurator](htps://github.com/CycriLabs/keycloak-configurator); the following context is expected:
  - `kcVersion`: the version of the Keycloak Configurator to use
  - `authServerUrl`: the URL of the Keycloak server
  - `authUser`: the user to authenticate with
  - `authPassword`: the password to authenticate with
  - `authTenant`: the tenant to authenticate with
- `change-env-var-value`: changes the value of an environment variable in a given `inputFile`; the following context is expected:
  - `name`: the variable to change the value of
  - `value`: the new value of the variable

All steps are working with a context object that is empty initially. Whenever
a use case starts, the context is filled with the following properties.
Throughout execution, steps can add or modify properties in the context object.

- `OS`: the operating system where the CLI is executed on; represents the result of [`process.platform`](https://nodejs.org/api/process.html#process_process_platform)
- `WORKSPACE_PATH`: the absolute path to the workspace
- `WORKING_DIR`: the absolute path to the working directory, see [Workspace structure](#workspace-structure)
- `SERVERS`: the list of all servers, see [Server configuration](#server-configuration)
- `REPOSITORIES`: the list of all repositories, see [Repository configuration](#repository-configuration)

The context can be accessed throughout different step types within a `formula`,
`command`, or `executor` via the properties in `context`. Whenever input is evaluated
based on the Javascript `eval` function, the context is available as a flat list
of properties. For example, assume the context looks as follows:

```javascript
const context = {
  server: 'local',
};
```

A formula can access the `server` property via:

```javascript
server === 'local' : 'yes' : 'no'
```

## Template repository

The template repository is a Git repository. The structure of the repository
is the same as the `config` directory in the workspace, described in the
[Workspace structure](#workspace-structure) section.

If a template repository is used, the repository is cloned into the workspace,
to the `config/git-templates` directory. The files from the template repository
are then copied over recursively to the `config` directory, overwriting all
existing files.

This allows to provide different servers, use cases, and other configurations
that are specific to a project. A common use case could be to provide additional
servers or repositories that are specific to a project. Furthermore, often the
`docker-compose-cxc.yml` is overwritten to use `cxc` specific services.

## CLI Development

To develop the CLI utility, it is necessary to install the dependencies:

```bash
npm install
```

Afterward, the tool can be executed via:

```bash
npm run dev
```

Commands can be executed as described above. They must be simply appended to
the `npm run dev` command:

```bash
npm run dev -- help init
```

### Testing

The tool can be tested end-2-end by executing the following command:

```bash
npm link
```

This adds a symlink to the global NPM packages, so that the tool can be executed
from any directory. The tool can be executed via:

```bash
ws-ctrl help
```

After testing, the symlink can be removed via:

```bash
npm uninstall ws-ctrl -g
```

### Use cases

It is possible to test use cases directly in the workspace. To do so, the use case
should be placed in the `assets/templates/config/use-cases` directory.
The use case can then be executed via:

```bash
npm run dev -- run ./assets/templates -u <use-case-name> --debug
```
