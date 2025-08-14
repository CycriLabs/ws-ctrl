import dotenv from 'dotenv';
import { Context, UseCaseStep } from '../../../types/index.js';
import { execCommand, readFile } from '../../../utils/index.js';
import { Executor } from '../executor.js';

export class GenerateServiceConfiguration extends Executor {
  async execute(step: UseCaseStep, context: Context): Promise<Context> {
    const executorContext = { ...context };
    const servicesFile = `${this.templatesAccess.getWorkspacePath()}/services.env`;
    const env = dotenv.parse(await readFile(servicesFile));
    Object.assign(executorContext, env);

    Object.entries(step.context || {}).forEach(([key, value]) => {
      executorContext[key] = this.scriptExecutor.executeFormula(
        value as string,
        executorContext
      );
    });

    const { kcVersion, authServerUrl, authUser, authPassword, authTenant } =
      executorContext;
    const pwd = this.templatesAccess.getWorkspacePath();

    // Execute the command to generate the service configuration;
    // the authPassword is wrapped in quotes to handle special characters, like ^
    // otherwise, they won't be passed correctly to the command
    const command = `docker run \
        --pull=always \
        --env-file ${pwd}/.env \
        --env KCC_WORKSPACE_PATH=${this.templatesAccess.getWorkspacePath()} \
        --env KCC_WORKING_DIR=${this.templatesAccess.getWorkingDir()} \
        --mount type=bind,src="${pwd}/config/secret-templates",target="/secret-templates,readonly" \
        --mount type=bind,src="${pwd}/config/services-config",target="/output" \
        --rm -i ghcr.io/cycrilabs/keycloak-configurator:${kcVersion} export-secrets -s ${authServerUrl} -u ${authUser} -p "${authPassword}" -r ${authTenant} -c //secret-templates -o //output`;
    await execCommand(command, this.templatesAccess.getWorkspacePath());
    return executorContext;
  }
}
