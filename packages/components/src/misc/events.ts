import { PartialIconCustomisations } from './customisations';

export interface PropEventPayload {
	prop: keyof PartialIconCustomisations;
	value: unknown;
	filtered: PartialIconCustomisations;
}
