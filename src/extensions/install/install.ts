import fs from 'fs-extra';
import path from 'path';
import { Workspace } from '../workspace';
import { PackageManager } from '../package-manager';
import { Reporter } from '../reporter';
import componentIdToPackageName from '../../utils/bit/component-id-to-package-name';
import { DEFAULT_REGISTRY_DOMAIN_PREFIX } from '../../constants';

async function symlinkCapsulesInNodeModules(isolatedEnvs) {
  await Promise.all(
    isolatedEnvs.map(async e => {
      const componentPackageName = componentIdToPackageName(
        e.component.id.legacyComponentId,
        DEFAULT_REGISTRY_DOMAIN_PREFIX
      );
      const linkPath = path.join(process.cwd(), 'node_modules', componentPackageName);
      await fs.mkdirp(path.dirname(linkPath));
      await fs.symlink(e.capsule.wrkDir, linkPath);
    })
  );
}

async function removeExistingLinksInNodeModules(isolatedEnvs) {
  await Promise.all(
    isolatedEnvs.map(async e => {
      const componentPackageName = componentIdToPackageName(
        e.component.id.legacyComponentId,
        DEFAULT_REGISTRY_DOMAIN_PREFIX
      );
      try {
        await fs.unlink(path.join(process.cwd(), 'node_modules', componentPackageName));
      } catch (err) {
        // if the symlink does not exist - no problem
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }
    })
  );
}

export class Install {
  constructor(private workspace: Workspace, private packageManager: PackageManager, private reporter: Reporter) {}
  async install() {
    this.reporter.startPhase('Installing');
    const components = await this.workspace.list();
    const isolatedEnvs = await this.workspace.load(components.map(c => c.id.toString()));
    const packageManagerName = this.workspace.consumer.config.packageManager;
    await removeExistingLinksInNodeModules(isolatedEnvs);
    await this.packageManager.runInstallInFolder(process.cwd(), {
      packageManager: packageManagerName
    });
    await symlinkCapsulesInNodeModules(isolatedEnvs);
    this.reporter.end();
    return isolatedEnvs;
  }
}
