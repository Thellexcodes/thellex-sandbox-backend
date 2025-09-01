import { API_VERSIONS } from '@/v1/config/versions';
import { Controller } from '@nestjs/common';

export function VersionedController101(
  path: string,
  version = API_VERSIONS.V101,
) {
  return Controller({ path, version: version });
}
