import { useState, useEffect } from 'react';

// Dynamically import all images from the imgs directory
const importAllImages = (requireContext: __WebpackModuleApi.RequireContext) => {
    const images: string[] = [];
    requireContext.keys().forEach((key) => {
        images.push(requireContext(key));
    });
    return images;
};

const imageUrls = importAllImages(require.context('../assets/imgs', false, /\.(png|jpe?g|svg)$/));

export function usePreloadedImages() {
    const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [isLoaded, setIsLoaded] = useState(false); // New state to track if all images are loaded

    const preloadImages = () => {
        const loadedImages: { [key: string]: HTMLImageElement } = {};
        let loadedCount = 0;

        imageUrls.forEach((url) => {
            // Extract the filename without the extension
            const filenameWithExtension = url.split('/').pop() || url;
            const filename = filenameWithExtension.split('.')[0]; // Remove the extension

            const img = new Image();
            img.src = url;

            img.onload = () => {
                loadedImages[filename] = img;
                loadedCount++;

                console.log("Image loaded:", filename, img);
                console.log("Current loadedImages object:", loadedImages);

                if (loadedCount === imageUrls.length) {
                    setImages((prevImages) => {
                        return { ...prevImages, ...loadedImages };
                    });
                    setIsLoaded(true);
                    console.log("All images preloaded:", loadedImages);
                }
            };

            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
            };
        });
    };

    // Log the state of "images" and "isLoaded" whenever they change
    useEffect(() => {
        console.log("Updated images state:", images);
        console.log("Updated isLoaded state:", isLoaded);
    }, [images, isLoaded]);

    // Automatically preload images when the hook is used
    useEffect(() => {
        preloadImages();
    }, []);

    return { images, isLoaded, preloadImages };
}