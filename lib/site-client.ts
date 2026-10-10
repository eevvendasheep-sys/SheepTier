// API adapter preserving the original interface. Permissions live on the server.
type Result = { data: any; error: { message: string } | null };
class Query implements PromiseLike<Result> {
  private operation = "select";
  private payload: any = null;
  private filters: Record<string, unknown> = {};
  private sort: string | undefined;
  private one = false;
  constructor(private table: string) {}
  select(_columns?: string) { return this; }
  insert(data: any) { this.operation = "insert"; this.payload = data; return this; }
  update(data: any) { this.operation = "update"; this.payload = data; return this; }
  upsert(data: any, _options?: any) { this.operation = "upsert"; this.payload = data; return this; }
  delete() { this.operation = "delete"; return this; }
  eq(key: string, value: unknown) { this.filters[key] = value; return this; }
  order(key: string) { this.sort = key; return this; }
  maybeSingle() { this.one = true; return this; }
  single() { this.one = true; return this; }
  async execute(): Promise<Result> {
    try {
      const res = await fetch("/api/data", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: this.table, operation: this.operation,
          payload: this.payload, filters: this.filters, sort: this.sort, one: this.one }),
      });
      const result: any = await res.json();
      if (!res.ok) return { data: null, error: { message: result.error || "Impossible d'enregistrer." } };
      return { data: result.data, error: null };
    } catch { return { data: null, error: { message: "Connexion interrompue. Réessaie." } }; }
  }
  then<TResult1 = Result, TResult2 = never>(
    onfulfilled?: ((value: Result) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> { return this.execute().then(onfulfilled, onrejected); }
}
const client = {
  from: (table: string) => new Query(table),
  auth: {
    async getUser() {
      const response = await fetch("/api/session", { cache: "no-store" });
      if (!response.ok) throw new Error("Impossible de vérifier ton compte.");
      const data: any = await response.json();
      return { data: { user: data.user }, error: null };
    },
    async signOut() { const r=await fetch("/api/admin-auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"logout"})});if(!r.ok)throw new Error("Déconnexion impossible.");window.location.assign("/"); },
  },
  storage: {
    from: (_bucket: string) => ({
      async upload(path: string, file: File, _options?: any) {
        try {
          const data = new FormData(); data.append("file", file); data.append("path", path);
          const response = await fetch("/api/logos", { method: "POST", body: data });
          const result: any = await response.json();
          return { error: response.ok ? null : { message: result.error || "Import impossible." } };
        } catch { return { error: { message: "Import interrompu. Réessaie." } }; }
      },
      getPublicUrl(path: string) { return { data: { publicUrl: "/api/logos?path=" + encodeURIComponent(path) } }; },
    }),
  },
};
export const hasSiteConnection = () => true;
export const getSiteClient = () => client;
