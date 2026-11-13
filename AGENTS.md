<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Hospital system sync enters via src/routes/api/public/sync/$kind.ts, guarded by SYNC_API_KEY bearer; it upserts so the agent can resend safely.
- Hosted HTML views exchange scoped messages with the parent data bridge; never pass tokens into the iframe or downloaded HTML, which remains a demo.
- Hospital reads and actions require explicit hospital_access membership; new accounts receive no hospital access automatically, preventing self-signup disclosure.
- Cashbox matching uses an atomic database transition and frozen snapshot, allowing one match and one undo without duplicating or drifting balances.
