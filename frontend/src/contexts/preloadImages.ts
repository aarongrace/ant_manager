import { create } from 'zustand';

// Dynamically import all images from the imgs directory
const importAllImages = (requireContext: __WebpackModuleApi.RequireContext) => {
    const images: { [key: string]: string } = {};
    requireContext.keys().forEach((key) => {
        const filenameWithExtension = key.split('/').pop() || key;
        const filename = filenameWithExtension.split('.')[0]; // Remove the extension
        images[filename] = requireContext(key);
    });
    return images;
};

const imageUrls = importAllImages(require.context('../assets/imgs', false, /\.(png|jpe?g|svg)$/));
const enemyImageUrls = importAllImages(require.context('../assets/imgs/enemies', false, /\.(png|jpe?g|svg)$/));
const iconImageUrls = importAllImages(require.context('../assets/imgs/icons', false, /\.(png|jpe?g|svg)$/));

interface PreloadImagesStore {
    images: { [key: string]: HTMLImageElement };
    isLoaded: boolean;
    getImage: (name: string) => HTMLImageElement | undefined;
    preloadImages: () => void;
}

export const usePreloadedImagesStore = create<PreloadImagesStore>((set, get) => ({
    images: {},
    isLoaded: false,

    preloadImages: () => {
        const loadedImages: { [key: string]: HTMLImageElement } = {};
        let loadedCount = 0;

        const allImages = { ...imageUrls, ...enemyImageUrls, ...iconImageUrls };

        Object.entries(allImages).forEach(([filename, url]) => {
            const img = new Image();
            img.src = url;

            img.onload = () => {
                loadedImages[filename] = img;
                loadedCount++;

                if (loadedCount === Object.keys(allImages).length) {
                    set((state) => ({
                        images: { ...state.images, ...loadedImages },
                        isLoaded: true,
                    }));
                }
            };

            img.onerror = () => {
                console.error(`Failed to load image: ${filename}`);
            };
        });

        console.log("images loaded", loadedImages);
        Object.entries(loadedImages).forEach(([key, img]) => {
            console.log("loaded image", key, img);
        });
    },

    getImage: (name: string) => {
        const state = get();
        if (state.images[name] === undefined) {
            console.error(`Image ${name} not found`);
            return undefined;
        } else {
            return state.images[name];
        }
    },
}));