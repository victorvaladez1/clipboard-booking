export async function pingBackend() {
    const r = await fetch("http://127.0.0.1:8000/");
    return r.status;
}