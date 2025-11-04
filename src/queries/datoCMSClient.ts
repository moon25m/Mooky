import { GraphQLClient } from 'graphql-request';
import { getDatoCmsToken } from './getDatoCmsToken';

const DATO_CMS_ENDPOINT = 'https://graphql.datocms.com/';
const DATO_CMS_API_TOKEN = getDatoCmsToken();

const headers: Record<string, string> = {};
if (DATO_CMS_API_TOKEN) {
  headers.Authorization = `Bearer ${DATO_CMS_API_TOKEN}`;
} else {
  // eslint-disable-next-line no-console
  console.warn('[DatoCMS] No API token configured; requests may fail in production.');
}

const datoCMSClient = new GraphQLClient(DATO_CMS_ENDPOINT, { headers });

export default datoCMSClient;
