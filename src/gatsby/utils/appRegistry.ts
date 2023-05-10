import {BASE_REGISTRY_URL} from './shared';

type FileData = {
  checksums: {
    [name: string]: string;
  };
};

type VersionData = {
  canonical: string;
  main_docs_url: string;
  name: string;
  repo_url: string;
  version: string;
  files?: {
    [name: string]: FileData;
  };
  package_url?: string;
};

export default class AppRegistry {
  indexCache: {[name: string]: VersionData} | null;

  constructor() {
    this.indexCache = null;
  }

  getList = async () => {
    if (!this.indexCache) {
      try {
        const result = await fetch(`${BASE_REGISTRY_URL}/apps`);
        this.indexCache = await result.json();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Unable to fetch index for app registry: ${err.message}`);
        this.indexCache = {};
      }
    }
    return this.indexCache;
  };

  getData = async (name: string) => {
    await this.getList();
    return this.indexCache[name];
  };

  version = async (name: string, defaultValue: string = '') => {
    const data = (await this.getData(name)) as VersionData;
    return (data && data.version) || defaultValue;
  };

  checksum = async (name: string, fileName: string, checksum: string) => {
    const data = (await this.getData(name)) as VersionData;
    if (!data.files) {
      return '';
    }
    return data.files[fileName].checksums[checksum] || '';
  };
}
