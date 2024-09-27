import { TypedDataDomain, TypedDataFields, TypedDataValue } from './model';

export interface ITypedDataSigner {
  signTypedData(domain: TypedDataDomain, types: TypedDataFields, value: TypedDataValue): Promise<string>;
}
