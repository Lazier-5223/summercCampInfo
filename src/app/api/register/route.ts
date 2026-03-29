import { NextResponse } from "next/server";

/**
 * 接收报名表单（multipart），并转发到：
 * - Formspree：设置 FORMSPREE_FORM_ID（在 formspree.io 创建表单后获得）
 * - 或任意 JSON Webhook：设置 REGISTRATION_WEBHOOK_URL（照片中转为文件名说明，便于 Zapier 等）
 */
export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "无效的表单数据" }, { status: 400 });
  }

  const formspreeId = process.env.FORMSPREE_FORM_ID;
  if (formspreeId) {
    const res = await fetch(`https://formspree.io/f/${formspreeId}`, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      let detail = "";
      try {
        detail = JSON.stringify(await res.json());
      } catch {
        detail = await res.text();
      }
      return NextResponse.json(
        { error: "提交到 Formspree 失败，请稍后重试", detail },
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
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
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
