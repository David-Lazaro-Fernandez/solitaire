// Fetches and decodes images up front so swapping an <img> src later is instant (no network, no decode jank)
export function preloadImages(urls: string[]): Promise<void> {
    return Promise.all(
        urls.map(url => {
            const img = new Image();
            img.src = url;
            return img.decode().catch(() => undefined);
        })
    ).then(() => undefined);
}
