export interface LicensePayload {
    team: string;
    issuedAt: string;
    expiresAt: string | null;
}
export interface LicenseResult {
    valid: boolean;
    payload?: LicensePayload;
    reason?: string;
}
/** Verifies a license key string of the form `PCBGRID1.<payload>.<signature>`. */
export declare function validateLicenseKey(key: string | undefined): Promise<LicenseResult>;
/** Fire-and-forget check used by <DataGrid licenseKey={...}>. Warns at most once per distinct key. */
export declare function checkLicense(key: string | undefined): void;
