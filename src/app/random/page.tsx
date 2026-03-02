import { fetchRandomAnime } from '@/lib/consumet';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RandomPage() {
    const randomAnime = await fetchRandomAnime();

    if (randomAnime && randomAnime.id) {
        redirect(`/watch/${randomAnime.id}`);
    } else {
        redirect('/');
    }
}
