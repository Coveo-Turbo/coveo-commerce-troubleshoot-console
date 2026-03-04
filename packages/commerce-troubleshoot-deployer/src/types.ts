export type RuntimeDefaults = {
  trackingId?: string;
  language?: string;
  country?: string;
  currency?: string;
  viewUrl?: string;
};

export type DeployAuthContext = {
  accessToken: string;
};

export type DeployTargetContext = {
  organizationId: string;
  hostedPageName: string;
  hostedPageId?: string;
  region?: string;
  environment?: string;
  defaultProductTemplatePresetId?: string;
};

export type KeyStrategyProvided = {
  mode: 'provided';
  engineAccessToken: string;
  cmhAccessToken?: string;
};

export type KeyStrategyManaged = {
  mode: 'managed';
  rotate?: boolean;
};

export type KeyStrategy = KeyStrategyProvided | KeyStrategyManaged;

export type ArtifactOptions = {
  templateDir?: string;
  version?: string;
};

export type DeployOptions = {
  dryRun?: boolean;
  outputRootDir?: string;
  bundleRelativeDir?: string;
  deployConfigRelativePath?: string;
};

export type DeployTroubleshootRequest = {
  target: DeployTargetContext;
  auth: DeployAuthContext;
  runtimeDefaults?: RuntimeDefaults;
  keyStrategy?: KeyStrategy;
  artifact?: ArtifactOptions;
  deploy?: DeployOptions;
};

export type ResolvedTokens = {
  engineAccessToken: string;
  cmhAccessToken: string;
  keyInfo: {
    created: boolean;
    reused: boolean;
    source: 'managed' | 'provided';
    engineKeyId?: string;
    cmhKeyId?: string;
  };
};

export type DeployTroubleshootResult = {
  organizationId: string;
  hostedPageName: string;
  hostedPageId?: string;
  deployed: boolean;
  bundleDir: string;
  deployConfigPath: string;
  runtimeConfigPath: string;
  keyInfo: {
    created: boolean;
    reused: boolean;
    source: 'managed' | 'provided';
    engineKeyId?: string;
    cmhKeyId?: string;
  };
  diagnostics: string[];
};

export type DeployResult = {
  stdout: string;
  stderr: string;
  hostedPageId?: string;
};

export type DeployExecutionOptions = {
  pageId?: string;
};

export interface DeployExecutor {
  deploy(configPath: string, cwd?: string, options?: DeployExecutionOptions): Promise<DeployResult>;
}

export type HostedPageLookupInput = {
  organizationId: string;
  accessToken: string;
  hostedPageName: string;
  region?: string;
  environment?: string;
  logger?: (message: string) => void;
};

export type HostedPageIdResolver = (input: HostedPageLookupInput) => Promise<string | undefined>;

export type DeployServiceOptions = {
  logger?: (message: string) => void;
  deployExecutor?: DeployExecutor;
  managedKeyCachePath?: string;
  hostedPageIdResolver?: HostedPageIdResolver;
};

export type RuntimeConfigPayload = {
  organizationId: string;
  region?: string;
  engineAccessToken: string;
  cmhAccessToken: string;
  hostedPageName: string;
  hostedPageId?: string;
  defaultProductTemplatePresetId?: string;
  defaults: {
    trackingId?: string;
    language: string;
    country: string;
    currency: string;
    viewUrl: string;
  };
};

export type TemplateManifest = {
  version: string;
  files: Record<
    string,
    {
      sha256: string;
      bytes: number;
    }
  >;
};
