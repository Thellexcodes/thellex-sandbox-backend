import { Injectable } from '@nestjs/common';

@Injectable()
export class VersionService {
  // These values can also come from DB or environment variables
  private readonly versionConfig = {
    android: {
      minimumVersion: '1.2.0', // must be >= this to run
      latestVersion: '1.4.0', // latest available
    },
    ios: {
      minimumVersion: '1.1.5',
      latestVersion: '1.3.2',
    },
  };

  checkVersion(platform: 'android' | 'ios', currentVersion: string) {
    const { minimumVersion, latestVersion } = this.versionConfig[platform];

    const compare = (a: string, b: string): number => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;
        if (na > nb) return 1;
        if (na < nb) return -1;
      }
      return 0;
    };

    if (compare(currentVersion, minimumVersion) < 0) {
      return { status: 'force_update', latestVersion }; // app must update
    }
    if (compare(currentVersion, latestVersion) < 0) {
      return { status: 'optional_update', latestVersion }; // recommend update
    }
    return { status: 'up_to_date', latestVersion };
  }
}
