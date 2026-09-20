/**
 * Central registry of storage paths.
 *
 * Every file lives under `images/<module>/<folder>/<file>`. Features must go
 * through `buildStoragePath` / `STORAGE_MODULES` so no path is hand-crafted
 * anywhere in the codebase.
 *
 * To add a new destination, extend `STORAGE_MODULES` below. Types flow through
 * automatically — `useFileStorage({ module, folder, ... })` will only accept
 * the newly registered `folder` for that module.
 */

type FolderMap = Record<string, string>;

type StorageModuleDefinition<F extends FolderMap = FolderMap> = {
  /** Segment used in the final path, e.g. `staff`. */
  segment: string;
  /** Named folders under this module (key = code alias, value = URL segment). */
  folders: F;
};

const STORAGE_ROOT = "images";

/**
 * Registered modules. Keys are used from code; `segment` + `folders` values
 * appear in the actual storage path.
 */
const STORAGE_MODULES = {
  agency: {
    segment: "agency",
    folders: {
      logo: "logo",
      cover: "cover",
    },
  },
  branches: {
    segment: "branches",
    folders: {
      logo: "logo",
      cover: "cover",
    },
  },
  staff: {
    segment: "staff",
    folders: {
      profilePhotos: "profile-photos",
      documents: "documents",
    },
  },
  drivers: {
    segment: "drivers",
    folders: {
      profilePhotos: "profile-photos",
      licenses: "licenses",
      documents: "documents",
    },
  },
  fleet: {
    segment: "fleet",
    folders: {
      photos: "photos",
      documents: "documents",
    },
  },
  rentToOwn: {
    segment: "rent-to-own",
    folders: {
      photos: "photos",
    },
  },
  customers: {
    segment: "customers",
    folders: {
      profilePhotos: "profile-photos",
    },
  },
  onboarding: {
    segment: "onboarding",
    folders: {
      commercialRegistration: "commercial-registration",
      taxCard: "tax-card",
      nationalId: "national-id",
    },
  },
} as const satisfies Record<string, StorageModuleDefinition>;

type StorageRegistry = typeof STORAGE_MODULES;
type StorageModule = keyof StorageRegistry;
type StorageFolder<M extends StorageModule> = keyof StorageRegistry[M]["folders"];

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9._-]/g, "");
}

type BuildStoragePathInput<M extends StorageModule> = {
  module: M;
  folder: StorageFolder<M>;
};

/**
 * Builds the normalized storage directory of the form
 * `images/<module-segment>/<folder-segment>`.
 *
 * The final file name is generated server-side and returned as `file_path`
 * on the upload response — clients never construct it.
 *
 * @example
 *   buildStoragePath({ module: 'staff', folder: 'profilePhotos' }) //
 *   → 'images/staff/profile-photos'
 */
function buildStoragePath<M extends StorageModule>(input: BuildStoragePathInput<M>): string {
  const definition = STORAGE_MODULES[input.module];
  const folders = definition.folders as Record<string, string>;
  const moduleSegment = sanitizeSegment(definition.segment);
  const folderSegment = sanitizeSegment(folders[input.folder as string] ?? "");

  return [STORAGE_ROOT, moduleSegment, folderSegment].join("/");
}

export { buildStoragePath, STORAGE_MODULES, STORAGE_ROOT };
export type { BuildStoragePathInput, StorageFolder, StorageModule };
