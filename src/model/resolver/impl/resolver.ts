import { generateRandomId } from '../../../helper/random';
import { Data } from '../../data';
import { ResolverData } from '../data';

/**
 * Resolver (also known as swap's "to" actor) representation
 *
 * @category Resolver
 */
export class Resolver implements Data<ResolverData> {
  /**
   * Plain data of the resolver. Can be used for serialization
   */
  public readonly data: ResolverData;

  public constructor(data: ResolverData) {
    this.data = data;
  }

  /**
   * Constructs unknown {@link Resolver} mockup
   *
   * @param known Known properties the resolver is unknown for
   *
   * @returns Instance of {@link Resolver}
   */
  public static unknown(known: Partial<Pick<ResolverData, 'address'>> = {}): Resolver {
    const data: ResolverData = {
      address: known.address ?? `unknown-resolver-address-${generateRandomId()}`,
      name: 'Unknown',
      icon: '',
    };
    return new Resolver(data);
  }

  /**
   * Address of the resolver account
   */
  public get address(): string {
    return this.data.address;
  }

  /**
   * Name of the resolver
   */
  public get name(): string {
    return this.data.name;
  }

  /**
   * Icon of the resolver
   */
  public get icon(): string {
    return this.data.icon;
  }
}
