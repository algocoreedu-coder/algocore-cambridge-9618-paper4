/**
 * Independent teaching oracle: no product imports, exported product fixtures,
 * or generated model output. Bound to the approved pilot convention at test time.
 * The layer order/journey is also cross-checked against the locally extracted
 * 9618_s24_ms_31 Q2(a) and 9618_s25_ms_32 Q3(b) source pages.
 */
export const LAYERS = Object.freeze(['application', 'transport', 'internet', 'link']);
export const REQUESTS = Object.freeze({
  'revision-page': Object.freeze({ id: 'revision-page', resource: '/revision', text: 'Request /revision' }),
  'diagram-image': Object.freeze({ id: 'diagram-image', resource: '/diagram.png', text: 'Request /diagram.png' }),
});
export const RESPONSIBILITY = Object.freeze({
  'agree-request-rules': 'application',
  'application-endpoints': 'transport',
  'destination-host': 'internet',
  'local-link': 'link',
});

export function expectedPilotTrace(payloadId) {
  if (!Object.hasOwn(REQUESTS, payloadId)) throw new RangeError('Unsupported oracle payload');
  const payload = REQUESTS[payloadId];
  let state = { payload: { ...payload }, wrappers: [], location: 'sender', delivered: false, linkScope: null };
  const result = [];
  const step = (id, actor, layer, direction, operation, change) => {
    const before = structuredClone(state);
    const changedWrapper = operation === 'add-wrapper' || operation === 'remove-wrapper' ? layer : null;
    change();
    result.push({ id, actor, layer, direction, operation, changedWrapper, before, after: structuredClone(state) });
  };
  for (const layer of LAYERS) {
    const operation = layer === 'application' ? 'create-payload' : 'add-wrapper';
    step(`sender-${layer}`, 'sender', layer, 'down', operation, () => {
      if (layer !== 'application') state.wrappers = [layer, ...state.wrappers];
      if (layer === 'link') state.linkScope = 'first-link';
    });
  }
  step('network-transit', 'network', null, 'across', 'transfer', () => { state.location = 'network'; state.linkScope = 'final-link'; });
  for (const layer of [...LAYERS].reverse()) {
    const operation = layer === 'application' ? 'deliver-payload' : 'remove-wrapper';
    step(`receiver-${layer}`, 'receiver', layer, 'up', operation, () => {
      state.location = 'receiver';
      if (layer === 'application') state.delivered = true;
      else {
        if (state.wrappers[0] !== layer) throw Error('Oracle stack order error');
        state.wrappers = state.wrappers.slice(1);
        if (layer === 'link') state.linkScope = null;
      }
    });
  }
  return result;
}
