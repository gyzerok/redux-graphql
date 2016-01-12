import createAdaptorShape from './createAdaptorShape';

export default function createContainerShape(PropTypes) {
  const adaptorShape = createAdaptorShape(PropTypes);
  return PropTypes.shape({
    adaptor: adaptorShape.isRequired,
    container: PropTypes.shape({
        state: PropTypes.shape({
            args: PropTypes.object,
            data: PropTypes.object
        }).isRequired,
        setArgs: PropTypes.func.isRequired
    }).isRequired
  });
}
