import { fetchAlbum } from '@/api/album'
import { AlbumApiNames } from '@/api/album'
import type { FetchAlbumParams, FetchAlbumResponse } from '@/api/album'
import reactQueryClient from '@/utils/reactQueryClient'

const fetch = async (params: FetchAlbumParams, noCache?: boolean) => {
  const album = await fetchAlbum(params, !!noCache)
  if (album?.album?.songs) {
    album.album.songs = album.songs
  }
  return album
}

export default function useAlbum(params: FetchAlbumParams, noCache?: boolean) {
  return useQuery(
    [AlbumApiNames.FETCH_ALBUM, params.id],
    () => fetch(params, noCache),
    {
      enabled: !!params.id,
      staleTime: 24 * 60 * 60 * 1000, // 24 hours
      placeholderData: (): FetchAlbumResponse =>
        window.ipcRenderer.sendSync('getApiCacheSync', {
          api: 'album',
          query: {
            id: params.id,
          },
        }),
    }
  )
}

export async function prefetchAlbum(params: FetchAlbumParams) {
  await reactQueryClient.prefetchQuery(
    [AlbumApiNames.FETCH_ALBUM, params.id],
    () => fetch(params),
    {
      staleTime: Infinity,
    }
  )
}
