import createAdaptorShape from './createAdaptorShape';

export function createContainerSliceShape(PropTypes) {
  return PropTypes.shape({
    args: PropTypes.object,
    data: PropTypes.object,
  });
}

export default function createContainerShape(PropTypes) {
  const adaptorShape = createAdaptorShape(PropTypes);
  const sliceShape = createContainerSliceShape(PropTypes);
  return PropTypes.shape({
    adaptor: adaptorShape.isRequired,
    container: PropTypes.shape({
      state: PropTypes.shape({
        current: sliceShape,
        pending: sliceShape,
        failed: sliceShape,
      }).isRequired,
      setArgs: PropTypes.func.isRequired,
    }).isRequired,
  });
}
