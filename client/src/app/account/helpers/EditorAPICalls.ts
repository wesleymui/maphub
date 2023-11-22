/**
 * This function will act as a gateway for all API calls the editor makes
 * This is here because I dont like the idea of mixing status codes
 * with modals.
 */

import MapAPI from 'api/MapAPI';
import PostAPI from 'api/PostAPI';
import { MHJSON } from 'types/MHJSON';

/**
 * Validate that an object is a recents object
 * @param a
 * @returns
 */
function validateRecents(a: any): a is Array<{
  _id: string;
  title: string;
  png: Buffer;
}> {
  for (let entry of a) {
    if (
      typeof entry._id !== 'string' ||
      typeof entry.title !== 'string' ||
      !entry.png ||
      entry.png.type !== 'Buffer' ||
      typeof entry.png.data !== 'object'
    ) {
      return false;
    }
  }
  return true;
}

/**
 *
 * @returns The 10 most recently edited maps
 */
export function getRecentUnpublished(): Promise<
  Array<{
    _id: string;
    title: string;
    png: Buffer;
  }>
> {
  return MapAPI.getRecentMapIds(6).then(res => {
    if (res.status === 200) {
      let maps = res.data.maps;
      if (typeof maps !== 'object') {
        throw new Error(`Unexpected maps type ` + typeof maps);
      }
      if (validateRecents(maps)) {
        return maps;
      }
    }
    throw new Error(res.status.toString() + JSON.stringify(res.data));
  });
}

/**
 *
 * @returns The 10 most recently published maps
 */
// export function getRecentPublished(): Promise<
//   Array<{
//     title: string;
//     description: string;
//     postID: string;
//     mapID: string;
//     png: Buffer;
//   }>
// > {
//   return PostAPI.queryPosts(6).then(res => {
//     if (res.status === 200) {
//       let maps = res.data.maps;
//       if (typeof maps !== 'object') {
//         throw new Error(`Unexpected maps type ` + typeof maps);
//       }
//       if (validateRecents(maps)) {
//         return maps;
//       }
//     }
//     throw new Error(res.status.toString() + JSON.stringify(res.data));
//   });
// }