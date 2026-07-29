import { BrowserRouter, Routes, Route } from 'react-router-dom';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Alfredo's</div>} />
      </Routes>
    </BrowserRouter>
  );
}
