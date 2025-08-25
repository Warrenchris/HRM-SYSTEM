// Performance optimization utilities

// Image preloader
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Preload multiple images
export const preloadImages = async (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.map(preloadImage));
};

// Memory usage monitor
export const logMemoryUsage = () => {
  if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
    const memory = (performance as any).memory;
    console.log({
      usedJSHeapSize: `${(memory.usedJSHeapSize / 1048576).toFixed(2)} MB`,
      totalJSHeapSize: `${(memory.totalJSHeapSize / 1048576).toFixed(2)} MB`,
      jsHeapSizeLimit: `${(memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`,
    });
  }
};

// Component render tracker
export const trackComponentRender = (componentName: string) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    
    return () => {
      const end = performance.now();
      const renderTime = end - start;
      
      if (renderTime > 16) { // Longer than one frame
        console.warn(`${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    };
  }
  
  return () => {}; // No-op in production
};

// Network request optimizer
export const optimizeNetworkRequests = () => {
  // Enable HTTP/2 server push hints
  if ('serviceWorker' in navigator) {
    // Preload critical resources
    const criticalResources = [
      '/fonts/main.woff2',
      '/api/user/profile',
    ];
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      if (resource.endsWith('.woff2')) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });
  }
};

// Lazy load utility
export const createIntersectionObserver = (
  callback: (entry: IntersectionObserverEntry) => void,
  options: IntersectionObserverInit = {}
) => {
  const defaultOptions: IntersectionObserverInit = {
    threshold: 0.1,
    rootMargin: '50px',
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach(callback);
  }, defaultOptions);
};