import { useState } from 'react';
import antImgUrl from '../assets/imgs/ant.png';
import bgImgUrl from '../assets/imgs/bg3.jpg';

export function usePreloadedImages() {
    const [images, setImages] = useState<{ [key: string]: HTMLImageElement }>({});
    const [isLoaded, setIsLoaded] = useState(false); // New state to track if all images are loaded
    const imageUrls = [antImgUrl, bgImgUrl];

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

                if (loadedCount === imageUrls.length) {
                    setImages(loadedImages);
                    setIsLoaded(true);
                    // console.log("All images preloaded:", loadedImages);
                }
            };

            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
            };
        });
    };

    return { images, isLoaded, preloadImages };
}