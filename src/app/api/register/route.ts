import { NextResponse } from "next/server";

/** 支持只填 ID，或误粘贴整段 https://formspree.io/f/xxx */
function normalizeFormspreeFormId(raw: string): string {
  const t = raw.trim();
  const fromUrl = t.match(/formspree\.io\/f\/([a-zA-Z0-9_-]+)/i);
  if (fromUrl) return fromUrl[1];
  return t.replace(/^\//, "").split(/[/?#]/)[0];
}

/** 克隆 FormData，并补充 Formspree 常用的回复邮箱字段 */
function prepareFormspreeBody(fd: FormData): FormData {
  const out = new FormData();
  let emailVal: string | null = null;
  let hasReplyTo = false;
  for (const [key, value] of fd.entries()) {
    out.append(key, value);
    if (key === "email" && typeof value === "string") emailVal = value;
    if (key === "_replyto") hasReplyTo = true;
  }
  if (emailVal && !hasReplyTo) out.append("_replyto", emailVal);
  return out;
}

function publicSiteUrl(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;
  return null;
}

/**
 * 接收报名表单（multipart），并转发到：
 * - Formspree：设置 FORMSPREE_FORM_ID（在 formspree.io 创建表单后获得）
 * - 或任意 JSON Webhook：设置 REGISTRATION_WEBHOOK_URL
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "无效的表单数据" }, { status: 400 });
  }

  const formspreeIdRaw = process.env.FORMSPREE_FORM_ID;
  if (formspreeIdRaw) {
    const formspreeId = normalizeFormspreeFormId(formspreeIdRaw);
    const body = prepareFormspreeBody(formData);

    const site = publicSiteUrl();
    const referer =
      request.headers.get("referer") ||
      request.headers.get("referrer") ||
      (site ? `${site}/` : null);
    const origin = request.headers.get("origin") || site;

    const forwardHeaders: Record<string, string> = {
      Accept: "application/json",
    };
    if (referer) forwardHeaders.Referer = referer;
    if (origin) forwardHeaders.Origin = origin;

    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      body,
      headers: forwardHeaders,
    });

    if (!res.ok) {
      let detail: string;
      try {
        const j = await res.json();
        detail = typeof j === "object" ? JSON.stringify(j) : String(j);
      } catch {
        detail = await res.text();
      }
      return NextResponse.json(
        {
          error: "提交到 Formspree 失败，请稍后重试",
          detail,
          status: res.status,
        },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, destination: "formspree" });
  }

  const webhookUrl = process.env.REGISTRATION_WEBHOOK_URL;
  if (webhookUrl) {
    const payload: Record<string, string> = { source: "aya-la-camp-form" };
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        payload[key] =
          value.size > 0 ? `[附件] ${value.name} (${value.type || "未知类型"})` : "";
      } else {
        payload[key] = String(value);
      }
    }
    const wr = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!wr.ok) {
      return NextResponse.json({ error: "Webhook 接收失败" }, { status: 502 });
    }
    return NextResponse.json({ ok: true, destination: "webhook" });
  }

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      {
        error:
          "服务器未配置数据接收。请在部署环境中设置 FORMSPREE_FORM_ID 或 REGISTRATION_WEBHOOK_URL。",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    ok: true,
    demo: true,
    message: "开发模式：未配置 FORMSPREE_FORM_ID / WEBHOOK，数据未发往外部服务。",
  });
}
