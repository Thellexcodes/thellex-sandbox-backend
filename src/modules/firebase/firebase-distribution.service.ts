// src/firebase/firebase-distribution.service.ts
import { Injectable, Logger } from '@nestjs/common';
import FormData from 'form-data';
import { createReadStream } from 'fs';
import { FirebaseAuthService } from './firebase-auth.service';
import { HttpService } from '@/middleware/http.service';
import axios from 'axios';

export type DistributePayload = {
  emails?: string[];
  groupIds?: string[]; // Firebase tester group IDs (e.g., group:abc123)
  releaseNotes?: string;
};

export interface FirebaseRelease {
  name: string; // e.g., projects/30201908784/apps/{appId}/releases/{releaseId}
  releaseNotes?: { text: string };
  displayVersion?: string;
  buildVersion?: string;
  binaryDownloadUri?: string;
  testingUri?: string;
  createTime?: string; // RFC3339 timestamp
}

export interface FirebaseTester {
  name: string; // e.g., projects/30201908784/testers/{email_address}
  displayName?: string;
  groups?: string[]; // e.g., [projects/30201908784/apps/{appId}/groups/{groupId}]
  lastActivityTime?: string; // RFC3339 timestamp
}

export interface FirebaseAuthData {
  token: string;
  projectNumber: string;
  appId: string;
}

export interface FirebaseGroup {
  name: string; // e.g., projects/30201908784/apps/{appId}/groups/{groupId}
  displayName: string;
  testerCount: number;
  releaseCount: number;
  inviteLinkCount?: number;
}

@Injectable()
export class FirebaseDistributionService {
  private readonly base = 'https://firebaseappdistribution.googleapis.com';
  private readonly logger = new Logger(FirebaseDistributionService.name);

  constructor(
    private readonly http: HttpService,
    private readonly auth: FirebaseAuthService,
  ) {}

  /** Uploads an APK/AAB and returns the created release object */
  async uploadBinary(localFilePath: string): Promise<FirebaseRelease> {
    try {
      const { token, projectNumber, appId } =
        await this.auth.getFirebaseAuthData();

      const url = `${this.base}/upload/v1/projects/${projectNumber}/apps/${appId}/releases:upload`;
      this.logger.log(`Uploading binary: ${localFilePath}. URL: ${url}`);

      const form = new FormData();
      form.append('binary', createReadStream(localFilePath));

      const data = await this.http.post<FirebaseRelease>(url, form, {
        headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });

      this.logger.log(`Successfully uploaded binary: ${data.name}`);
      return data;
    } catch (err) {
      this.logger.error(
        `Failed to upload binary: ${localFilePath}`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Upload failed: ${err.message}`);
    }
  }

  /** Set release notes for a release */
  async setReleaseNotes(releaseName: string, notes: string): Promise<void> {
    if (!notes) return;
    try {
      const { token } = await this.auth.getFirebaseAuthData();
      const url = `${this.base}/v1/${releaseName}?updateMask=releaseNotes.text`;
      this.logger.log(`Setting release notes for ${releaseName}. URL: ${url}`);

      await this.http.patch(
        url,
        { releaseNotes: { text: notes } },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      this.logger.log(`Release notes updated for ${releaseName}`);
    } catch (err) {
      this.logger.error(
        `Failed to set release notes for ${releaseName}`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Failed to set release notes: ${err.message}`);
    }
  }

  /** List all groups for the app */
  async listGroups(): Promise<FirebaseGroup[]> {
    try {
      const { token, projectNumber, appId } =
        await this.auth.getFirebaseAuthData();

      const url = `${this.base}/v1/projects/${projectNumber}/apps/${appId}/groups`;
      this.logger.log(
        `Fetching groups for project ${projectNumber}, app ${appId}. URL: ${url}`,
      );

      const data = await this.http.get<{ groups: FirebaseGroup[] }>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.logger.log(`Fetched ${data.groups?.length || 0} groups`);
      return data.groups || [];
    } catch (err) {
      this.logger.error(
        'Failed to list groups',
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Failed to list groups: ${err.message}`);
    }
  }

  /** Get group details to verify existence */
  async getGroup(groupId: string): Promise<FirebaseGroup> {
    try {
      const { token, projectNumber, appId } =
        await this.auth.getFirebaseAuthData();

      const url = `${this.base}/v1/projects/${projectNumber}/apps/${appId}/groups/${groupId}`;
      this.logger.log(`Fetching group details for ${groupId}. URL: ${url}`);

      const data = await this.http.get<FirebaseGroup>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.logger.log(
        `Fetched group details: ${data.name} (Display Name: ${data.displayName})`,
      );
      return data;
    } catch (err) {
      this.logger.error(
        `Failed to fetch group ${groupId}`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Failed to fetch group: ${err.message}`);
    }
  }

  /** Add a tester to a Firebase group */
  async addTesterToGroup(
    email: string,
    groupId: string = 'v1testers',
  ): Promise<{ emailsAdded: string[]; failedEmails?: string[] }> {
    try {
      // Validate email
      if (!this.isValidEmail(email)) {
        throw new Error(`Invalid email format: ${email}`);
      }

      const { token, projectNumber, appId } =
        await this.auth.getFirebaseAuthData();

      // Verify group exists
      await this.getGroup(groupId);

      const url = `${this.base}/v1/projects/${projectNumber}/apps/${appId}/groups/${groupId}/testers:batchAdd`;
      this.logger.log(
        `Adding tester ${email} to group ${groupId}. URL: ${url}`,
      );

      const data = await this.http.post<{
        emails: string[];
        invalidEmails?: string[];
      }>(
        url,
        { emails: [email] },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      this.logger.log(`Tester ${email} added to group ${groupId}`);
      return {
        emailsAdded: data.emails || [email],
        failedEmails: data.invalidEmails || [],
      };
    } catch (err) {
      this.logger.error(
        `Failed to add tester ${email} to group ${groupId}`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Failed to add tester: ${err.message}`);
    }
  }

  private async getFileSize(url: string): Promise<number> {
    try {
      const { headers } = await this.http.head(url);
      const contentLength = headers['content-length'];
      if (!contentLength) {
        throw new Error('Content-Length header not found');
      }
      return parseInt(contentLength, 10);
    } catch (err) {
      this.logger.error(
        `Failed to fetch file size for ${url}`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Failed to fetch file size: ${err.message}`);
    }
  }

  /** Get the latest release and distribute to a single email */
  async getLatestReleaseAndDistribute(email: string): Promise<{
    releaseName: string;
    downloadUrl?: string;
    fileSizeBytes?: number;
  }> {
    try {
      // Validate email
      if (!this.isValidEmail(email)) {
        throw new Error(`Invalid email format: ${email}`);
      }

      const { token, projectNumber, appId } =
        await this.auth.getFirebaseAuthData();

      // Fetch the latest release
      const releasesUrl = `${this.base}/v1/projects/${projectNumber}/apps/${appId}/releases?sortBy=createTime&orderBy=DESC&pageSize=1`;
      this.logger.log(
        `Fetching latest release for app ${appId}. URL: ${releasesUrl}`,
      );

      const data = await this.http.get<{ releases: FirebaseRelease[] }>(
        releasesUrl,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!data.releases || data.releases.length === 0) {
        throw new Error(`No releases found for app ${appId}`);
      }

      const latestRelease = data.releases[0];
      this.logger.log(`Latest release found: ${latestRelease.name}`);

      // Get file size if binaryDownloadUri is available
      let fileSizeBytes: number | undefined;
      if (latestRelease.binaryDownloadUri) {
        fileSizeBytes = await this.getFileSize(latestRelease.binaryDownloadUri);
      }

      // Distribute to the email
      const distributeUrl = `${this.base}/v1/${latestRelease.name}:distribute`;
      this.logger.log(
        `Distributing release ${latestRelease.name} to ${email}. URL: ${distributeUrl}`,
      );

      await this.http.post(
        distributeUrl,
        { testerEmails: [email] },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      this.logger.log(`Distributed release ${latestRelease.name} to ${email}`);
      return {
        releaseName: latestRelease.name,
        downloadUrl: latestRelease.binaryDownloadUri,
        fileSizeBytes,
      };
    } catch (err) {
      this.logger.error(
        `Failed to get latest release or distribute to ${email}`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Failed to distribute release: ${err.message}`);
    }
  }

  /** Distribute a release to testers and/or groups */
  async distribute(
    releaseName: string,
    payload: DistributePayload,
  ): Promise<void> {
    try {
      // Validate inputs
      if (payload.emails?.length) {
        payload.emails = payload.emails.filter(this.isValidEmail);
        if (payload.emails.length === 0) {
          throw new Error('No valid emails provided for distribution');
        }
      }
      if (payload.groupIds?.length) {
        await Promise.all(
          payload.groupIds.map((groupId) => this.getGroup(groupId)),
        );
      }
      if (!payload.emails?.length && !payload.groupIds?.length) {
        throw new Error(
          'At least one email or group ID must be provided for distribution',
        );
      }

      const { token } = await this.auth.getFirebaseAuthData();
      const url = `${this.base}/v1/${releaseName}:distribute`;
      this.logger.log(`Distributing release ${releaseName}. URL: ${url}`);

      const body: { testerEmails?: string[]; groupAliases?: string[] } = {};
      if (payload.emails?.length) body.testerEmails = payload.emails;
      if (payload.groupIds?.length) body.groupAliases = payload.groupIds;

      await this.http.post(url, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.logger.log(
        `Distributed release ${releaseName} to testers: ${payload.emails?.join(', ') || ''}, groups: ${payload.groupIds?.join(', ') || ''}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to distribute ${releaseName}`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Distribution failed: ${err.message}`);
    }
  }

  /** Full pipeline: upload → notes → distribute */
  async uploadAndDistribute(
    localFilePath: string,
    payload: DistributePayload,
  ): Promise<{ releaseName: string }> {
    try {
      const release = await this.uploadBinary(localFilePath);
      if (payload.releaseNotes) {
        await this.setReleaseNotes(release.name, payload.releaseNotes);
      }
      await this.distribute(release.name, payload);
      this.logger.log(`Upload and distribution completed for ${release.name}`);
      return { releaseName: release.name };
    } catch (err) {
      this.logger.error(
        `Upload and distribution pipeline failed`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Pipeline failed: ${err.message}`);
    }
  }

  /** List all apps in the project to verify appId */
  async listApps(): Promise<string[]> {
    try {
      const { token, projectNumber, appId } =
        await this.auth.getFirebaseAuthData();

      const url = `${this.base}/v1/projects/${projectNumber}/apps/${appId}/releases`;
      console.log({ appId });
      this.logger.debug(
        `Fetching apps for project ${projectNumber}. URL: ${url}`,
      );

      const data = await this.http.get<{ releases: { name: string }[] }>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log(data.releases);

      this.logger.log(`Fetched ${data.releases?.length || 0} apps`);
      return data.releases?.map((app) => app.name.split('/').pop()) || [];
    } catch (err) {
      console.log(err);
      // this.logger.error(
      //   'Failed to list apps',
      //   JSON.stringify(err.response?.data, null, 2),
      // );
      // throw new Error(`Failed to list apps: ${err.message}`);
    }
  }

  /** Get release info (download URL, version, notes, etc.) */
  async getReleaseInfo(releaseName: string): Promise<FirebaseRelease> {
    try {
      const { token } = await this.auth.getFirebaseAuthData();
      const url = `${this.base}/v1/${releaseName}`;
      this.logger.log(`Fetching release info for ${releaseName}. URL: ${url}`);

      const data = await this.http.get<FirebaseRelease>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.logger.log(`Fetched release info for ${releaseName}`);
      return data;
    } catch (err) {
      this.logger.error(
        `Failed to fetch release info for ${releaseName}`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Failed to fetch release info: ${err.message}`);
    }
  }

  /** Get tester details, including group membership */
  async getTesterInfo(email: string): Promise<FirebaseTester> {
    try {
      if (!this.isValidEmail(email)) {
        throw new Error(`Invalid email format: ${email}`);
      }

      const { token, projectNumber } = await this.auth.getFirebaseAuthData();
      const testerResourceName = `projects/${projectNumber}/testers/${encodeURIComponent(email)}`;
      const url = `${this.base}/v1/${testerResourceName}`;
      this.logger.log(`Fetching tester info for ${email}. URL: ${url}`);

      const data = await this.http.get<FirebaseTester>(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.logger.log(`Fetched tester info for ${email}: ${data.name}`);
      return data;
    } catch (err) {
      this.logger.error(
        `Failed to fetch tester info for ${email}`,
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Failed to fetch tester info: ${err.message}`);
    }
  }

  /** Verify service account permissions */
  async checkPermissions(): Promise<string[]> {
    try {
      const { token, projectNumber } = await this.auth.getFirebaseAuthData();

      const url = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectNumber}:testIamPermissions`;
      // const permissions = [
      //   'firebaseappdistro.testers.create', // Required for batchAdd
      //   'firebaseappdistro.groups.get', // Required for getGroup
      // ];

      const permissions = [
        'firebaseappdistro.testers.create',
        'firebaseappdistro.groups.get',
        'firebaseappdistro.groups.update',
        'firebaseappdistro.releases.distribute',
        'firebaseappdistro.releases.list',
        'firebaseappdistro.releases.update',
        'firebaseappdistro.testers.get',
      ];

      this.logger.log(
        `Checking permissions for project ${projectNumber}. URL: ${url}`,
      );

      const data = await this.http.post<{ permissions: string[] }>(
        url,
        { permissions },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      this.logger.log(`Permissions: ${JSON.stringify(data.permissions)}`);
      return data.permissions || [];
    } catch (err) {
      this.logger.error(
        'Failed to check permissions',
        JSON.stringify(err.response?.data, null, 2),
      );
      throw new Error(`Failed to check permissions: ${err.message}`);
    }
  }

  /** Helper: Validate email format */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
