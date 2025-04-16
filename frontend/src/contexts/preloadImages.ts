import { create } from 'zustand';

// Dynamically import all images from the imgs directory
const importAllImages = (requireContext: __WebpackModuleApi.RequireContext) => {
    const images: string[] = [];
    requireContext.keys().forEach((key) => {
        images.push(requireContext(key));
    });
    return images;
};

const imageUrls = importAllImages(require.context('../assets/imgs', false, /\.(png|jpe?g|svg)$/));

interface PreloadImagesStore {
    images: { [key: string]: HTMLImageElement };
    isLoaded: boolean;
    preloadImages: () => void;
}

export const usePreloadedImagesStore = create<PreloadImagesStore>((set) => ({
    images: {},
    isLoaded: false,

    preloadImages:  () => {
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
                    set((state) => ({
                        images: { ...state.images, ...loadedImages },
                        isLoaded: true,
                    }));
                }
            };

            img.onerror = () => {
                console.error(`Failed to load image: ${url}`);
            };
        });
    },
}));