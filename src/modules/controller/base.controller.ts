import { API_VERSIONS } from '@/config/versions';
import { Controller } from '@nestjs/common';

export function VersionedController001(
  path: string,
  version = API_VERSIONS.V100,
) {
  return Controller({ path, version: version });
}
