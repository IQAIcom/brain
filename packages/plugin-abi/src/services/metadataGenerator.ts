import {
	ModelClass,
	composeContext,
	generateMessageResponse,
} from "@elizaos/core";
import type { FunctionMetadata } from "../types";
import { FUNCTION_METADATA_TEMPLATE } from "../lib/template";

export class MetadataService {
	constructor(
		private contractName: string,
		private description: string,
	) {}
}
