import React from "react";
import { useNavigate } from "react-router-dom";


function BotonVolver({ visible = true }) {
  const navigate = useNavigate();

  if (!visible) return null; 

  return (
    <button className="btn-volver" onClick={() => navigate(-1)}>
      <img
        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAAB0UlEQVR4nO3
        aS4uPcRQH8E/JrZCwcEsuI0MW09hoyNi5LsklNUnEC7DxNizs7SQbKbN02zFj5bpwy60ouYSI0VP/pyYNc1bS+Z9P/V7A99TzPOd3zkMppZRSSinlP
        zMfZ/AAIziJKbrEajzD2G/nrC6wFi8nCN+ePomtx+u/hG/OkKT68GaS8M0ZlFA/3gbCj2KqZDbiXSB881JcJZlNeB8I/yRj+C34EAj/GCsksxUfA+H
        vY4lktuNLIPw9LJbMrmD4O1gomT34FvzULZDMPnwPhL+FeZI5EAx/A3MkcwQ/AuGvYbZkjgXDX8EsyZzAz0D4y5gpmeOB4M25iOmSWYbPgfAXME1CQ
        4Hw5zJeaVuHAgW4hBmSWopPwSKke/5bh4NfgOGMX4DW0WAPcDVjA9Q6GGyBr2dsgVv7g0W4mfES1NobvAaPdNZhKe3G10ARbmecBbR2BKdBd7FIUtu
        CrXLKYej4cXhkIvyw01iltDm4E2gWIislNRDcCj1Fj6Q2BJeir7BOUv3BIjQ/TfTq0r9CxsYtTNJepXvxIlCEnRJbg+eTFKCZOabW03nz/6kAzQ8V6
        S3HownCn9dF5uJ0py1uFqanMg9TSymllFJK8W/9AjWgg+AZjk+3AAAAAElFTkSuQmCC"
        alt="Volver"
        className="icono-volver"
      />
    </button>
  );
}

export default BotonVolver;
