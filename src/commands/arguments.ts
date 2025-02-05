import { Argument } from 'commander';

const argFn = () => new Argument('[workspace-path]', 'path to the workspace');

export const workspacePathArgument = argFn();

export const defaultWorkspacePathArgument = argFn().default('.');
