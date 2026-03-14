const PlantLoader = ({ title = 'Growing your workspace...', subtitle = 'Please wait while we prepare things.' }) => {
  return (
    <div className="plant-loader-wrap" role="status" aria-live="polite" aria-label={title}>
      <div className="plant-loader-card">
        <div className="plant-loader-scene" aria-hidden="true">
          <div className="plant-loader-ground" />
          <div className="plant-loader-pot" />
          <div className="plant-loader-stem" />
          <div className="plant-loader-leaf plant-loader-leaf-left" />
          <div className="plant-loader-leaf plant-loader-leaf-right" />
          <div className="plant-loader-canopy" />

          <div className="plant-loader-watering-arm">
            <div className="plant-loader-can-body" />
            <div className="plant-loader-can-handle" />
            <div className="plant-loader-can-spout" />
          </div>

          <span className="plant-loader-drop plant-loader-drop-1" />
          <span className="plant-loader-drop plant-loader-drop-2" />
          <span className="plant-loader-drop plant-loader-drop-3" />
          <span className="plant-loader-drop plant-loader-drop-4" />
        </div>

        <div className="plant-loader-text">
          <p className="plant-loader-title">{title}</p>
          <p className="plant-loader-subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default PlantLoader;
