import { backend } from '~/src/backend/yt';

export default defineEventHandler(async (event) => {

	const id = getRouterParam(event, "id");
	const range = getHeader(event, "Range");
	if (!id) return;

	return await backend.stream(id, range);

});