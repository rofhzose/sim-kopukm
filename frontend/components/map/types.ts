export interface FeatureProperties {
  kecamatan: string;
  umkm: number;
  koperasi: number;
}

export interface GeoJsonFeature {
  type: string;
  properties: FeatureProperties;
  geometry: any;
}
