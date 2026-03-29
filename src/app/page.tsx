"use client";

import { useCallback, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Shirt,
  User,
  UserCircle2,
  Users,
} from "lucide-react";

const SHIRT_SIZES = [
  "幼童 3T (90-100cm)",
  "幼童 4T (100-110cm)",
  "幼童 5T (110-115cm)",
  "青少年 加小码 (XS)",
  "青少年 小码 (S)",
  "青少年 中码 (M)",
  "青少年 大码 (L)",
  "青少年 加大码 (XL)",
  "成人 加小码 (XS)",
  "成人 小码 (S)",
  "成人 中码 (M)",
  "成人 大码 (L)",
  "成人 加大码 (XL)",
  "成人 加加大码 (XXL)",
] as const;

const GRADES = [
  "学龄前",
  "幼儿园 (K)",
  "一年级",
  "二年级",
  "三年级",
  "四年级",
  "五年级",
  "六年级",
  "七年级",
  "八年级",
  "九年级",
  "十年级",
  "十一年级",
  "十二年级",
  "其他 / 在家教育",
] as const;

type PayOption = "full" | "deposit";

type FormState = {
  studentLastName: string;
  studentFirstName: string;
  englishName: string;
  dob: string;
  genderIdentity: string;
  grade: string;
  school: string;
  shirtSize: string;
  parentName: string;
  relationship: string;
  email: string;
  country: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  payOption: PayOption;
  policyAccepted: boolean;
};

const initialForm: FormState = {
  studentLastName: "",
  studentFirstName: "",
  englishName: "",
  dob: "",
  genderIdentity: "",
  grade: "",
  school: "",
  shirtSize: "",
  parentName: "",
  relationship: "",
  email: "",
  country: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
  payOption: "full",
  policyAccepted: false,
};

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function buildRegistrationFormData(form: FormState): FormData {
  const fd = new FormData();
  fd.append("studentLastName", form.studentLastName);
  fd.append("studentFirstName", form.studentFirstName);
  fd.append("englishName", form.englishName);
  fd.append("dob", form.dob);
  fd.append("genderIdentity", form.genderIdentity);
  fd.append("grade", form.grade);
  fd.append("school", form.school);
  fd.append("shirtSize", form.shirtSize);
  fd.append("parentName", form.parentName);
  fd.append("relationship", form.relationship);
  fd.append("email", form.email);
  fd.append("_replyto", form.email);
  fd.append("country", form.country);
  fd.append("addressLine1", form.address1);
  fd.append("addressLine2", form.address2);
  fd.append("city", form.city);
  fd.append("state", form.state);
  fd.append("zip", form.zip);
  fd.append("payOption", form.payOption);
  fd.append("policyAccepted", form.policyAccepted ? "yes" : "no");
  return fd;
}

export default function CampRegistrationPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitDemo, setSubmitDemo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = useCallback(<K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => {
      if (!e[key as string]) return e;
      const next = { ...e };
      delete next[key as string];
      return next;
    });
  }, []);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.studentLastName.trim()) e.studentLastName = "请填写学生姓氏";
    if (!form.studentFirstName.trim()) e.studentFirstName = "请填写学生名字";
    if (!form.englishName.trim()) e.englishName = "请填写英文称呼";
    if (!form.dob) e.dob = "请选择出生日期";
    if (!form.genderIdentity) e.genderIdentity = "请选择性别认同";
    if (!form.grade) e.grade = "请选择当前年级";
    if (!form.school.trim()) e.school = "请填写就读学校";
    if (!form.shirtSize) e.shirtSize = "请选择 T-Shirt 尺码";
    if (!form.parentName.trim()) e.parentName = "请填写家长姓名";
    if (!form.relationship.trim()) e.relationship = "请填写与孩子关系";
    if (!form.email.trim()) e.email = "请填写常用邮箱";
    else if (!validateEmail(form.email)) e.email = "请输入有效的邮箱地址";
    if (!form.address1.trim()) e.address1 = "请填写详细地址";
    if (!form.city.trim()) e.city = "请填写城市";
    if (!form.state.trim()) e.state = "请填写省 / 州";
    if (!form.zip.trim()) e.zip = "请填写邮政编码";
    if (!form.country.trim()) e.country = "请填写国家";
    if (!form.policyAccepted) e.policyAccepted = "请阅读并勾选同意退款政策与营地安排";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const fd = buildRegistrationFormData(form);
      const res = await fetch("/api/register", { method: "POST", body: fd });
      const data = (await res.json()) as {
        ok?: boolean;
        demo?: boolean;
        error?: string;
        message?: string;
        detail?: string;
        status?: number;
      };
      if (!res.ok) {
        const base = data.error || "提交失败，请稍后重试";
        const extra = data.detail ? `\n\n详情：${data.detail}` : "";
        throw new Error(base + extra);
      }
      setSubmitDemo(Boolean(data.demo));
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field: string) =>
    `input-field ${errors[field] ? "input-field-error" : ""}`;

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-stone-200/80 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-5 py-5 md:px-8 md:py-6">
          <p className="font-serif text-lg font-semibold tracking-wide text-earth md:text-xl">
            阿垚在洛杉矶
            <span className="mx-2 font-sans font-normal text-stone-400">|</span>
            <span className="font-sans text-base font-normal text-stone-600 md:text-lg">
              加州游学咨询
            </span>
          </p>
          <div className="mt-3 h-px max-w-[200px] bg-earth/40" aria-hidden />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-10 pb-24 md:px-8 md:py-14 md:pb-32">
        {submitted && (
          <div
            className="mb-10 flex items-start gap-3 rounded-lg border border-earth/20 bg-white p-4 shadow-sm"
            role="status"
          >
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-earth" aria-hidden />
            <div>
              <p className="font-medium text-stone-800">报名信息已提交</p>
              <p className="mt-1 text-sm text-stone-600">
                我们已收到您的登记。工作人员将尽快通过您预留的邮箱与您确认。
              </p>
              <p className="mt-2 text-sm font-medium text-earth">
                请将孩子近期正脸头像照（1:1 比例、清晰）在提交后单独通过微信发给我。
              </p>
              {submitDemo && (
                <p className="mt-2 text-sm text-amber-800">
                  当前为开发模式：未配置 Formspree / Webhook，数据未发送到外部服务。部署时请在服务器环境变量中设置
                  FORMSPREE_FORM_ID 或 REGISTRATION_WEBHOOK_URL。
                </p>
              )}
            </div>
          </div>
        )}

        {submitError && (
          <div
            className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50/90 p-4 text-sm text-red-900"
            role="alert"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <div className="min-w-0 whitespace-pre-wrap break-words">{submitError}</div>
          </div>
        )}

        <div className="mb-10 text-center md:mb-12">
          <h1 className="font-serif text-4xl font-semibold tracking-wide text-earth md:text-[2.8125rem]">
            夏令营报名信息表
          </h1>
          <p className="mt-3 text-sm text-stone-600 md:text-base">请完整填写下列信息</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-14 md:space-y-16" noValidate>
          {/* 1. 基本信息 */}
          <section className="space-y-8" aria-labelledby="section-basic">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <User className="h-8 w-8 shrink-0 text-earth" aria-hidden />
              <h2 id="section-basic" className="section-title">
                学生与家长基本信息
              </h2>
            </div>

            <div>
              <h3 className="form-block-title">
                <UserCircle2 className="h-4 w-4 shrink-0 text-earth sm:h-5 sm:w-5" aria-hidden />
                学生姓名
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="lastName" className="label-text">
                    姓 <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    className={inputClass("studentLastName")}
                    value={form.studentLastName}
                    onChange={(ev) => update("studentLastName", ev.target.value)}
                  />
                  {errors.studentLastName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.studentLastName}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="firstName" className="label-text">
                    名 <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    className={inputClass("studentFirstName")}
                    value={form.studentFirstName}
                    onChange={(ev) => update("studentFirstName", ev.target.value)}
                  />
                  {errors.studentFirstName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.studentFirstName}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="englishName" className="label-text">
                    英文称呼 <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="englishName"
                    type="text"
                    className={inputClass("englishName")}
                    placeholder="例如：Lydia"
                    value={form.englishName}
                    onChange={(ev) => update("englishName", ev.target.value)}
                  />
                  {errors.englishName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.englishName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="form-block-title">
                <FileText className="h-4 w-4 shrink-0 text-earth sm:h-5 sm:w-5" aria-hidden />
                学生档案
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="dob" className="label-text">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-stone-500" aria-hidden />
                      出生日期 <span className="text-red-600">*</span>
                    </span>
                  </label>
                  <input
                    id="dob"
                    type="date"
                    className={inputClass("dob")}
                    value={form.dob}
                    onChange={(ev) => update("dob", ev.target.value)}
                  />
                  {errors.dob && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.dob}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="grade" className="label-text">
                    当前年级（2025–2026 学年）<span className="text-red-600">*</span>
                  </label>
                  <select
                    id="grade"
                    className={inputClass("grade")}
                    value={form.grade}
                    onChange={(ev) => update("grade", ev.target.value)}
                  >
                    <option value="">请选择</option>
                    {GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                  {errors.grade && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.grade}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <fieldset>
                    <legend className="form-legend-title">
                      性别认同 <span className="text-red-600">*</span>
                    </legend>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {(["男", "女"] as const).map((g) => (
                        <label
                          key={g}
                          className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-stone-200 bg-white px-4 py-3 transition-colors has-[:checked]:border-earth/40 has-[:checked]:bg-earth/[0.04]"
                        >
                          <input
                            type="radio"
                            name="genderIdentity"
                            className="accent-earth"
                            checked={form.genderIdentity === g}
                            onChange={() => update("genderIdentity", g)}
                          />
                          <span className="text-sm font-medium text-stone-800">{g}</span>
                        </label>
                      ))}
                    </div>
                    {errors.genderIdentity && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.genderIdentity}
                      </p>
                    )}
                  </fieldset>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="school" className="label-text">
                    就读学校 <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="school"
                    type="text"
                    className={inputClass("school")}
                    value={form.school}
                    onChange={(ev) => update("school", ev.target.value)}
                  />
                  {errors.school && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.school}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="shirtSize" className="label-text">
                <span className="inline-flex items-center gap-1">
                  <Shirt className="h-3.5 w-3.5 text-stone-500" aria-hidden />
                  T-Shirt 尺码 <span className="text-red-600">*</span>
                </span>
              </label>
              <select
                id="shirtSize"
                className={inputClass("shirtSize")}
                value={form.shirtSize}
                onChange={(ev) => update("shirtSize", ev.target.value)}
              >
                <option value="">请选择尺码</option>
                {SHIRT_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.shirtSize && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.shirtSize}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-earth/25 bg-earth/[0.06] px-4 py-3.5 text-sm leading-relaxed text-stone-800 md:px-5 md:py-4 md:text-base">
              <p className="font-medium text-earth">孩子头像照</p>
              <p className="mt-2 text-stone-700">
                请将孩子近期<strong>正脸头像照</strong>（<strong>1:1</strong>{" "}
                比例、光线清晰）在提交报名表后，<strong>单独通过微信发给我</strong>。
              </p>
            </div>

            <div>
              <h3 className="form-block-title">
                <Users className="h-4 w-4 shrink-0 text-earth sm:h-5 sm:w-5" aria-hidden />
                家长信息
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="parentName" className="label-text">
                    姓名 <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="parentName"
                    type="text"
                    autoComplete="name"
                    className={inputClass("parentName")}
                    value={form.parentName}
                    onChange={(ev) => update("parentName", ev.target.value)}
                  />
                  {errors.parentName && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.parentName}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="relationship" className="label-text">
                    与孩子关系 <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="relationship"
                    type="text"
                    className={inputClass("relationship")}
                    placeholder="例如：母亲"
                    value={form.relationship}
                    onChange={(ev) => update("relationship", ev.target.value)}
                  />
                  {errors.relationship && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.relationship}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="label-text">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-stone-500" aria-hidden />
                      常用邮箱 <span className="text-red-600">*</span>
                    </span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={inputClass("email")}
                    value={form.email}
                    onChange={(ev) => update("email", ev.target.value)}
                  />
                  {errors.email && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-4 sm:col-span-2">
                  <h4 className="form-block-subtitle">
                    <MapPin className="h-4 w-4 shrink-0 text-earth sm:h-5 sm:w-5" aria-hidden />
                    联系地址
                  </h4>

                  <div>
                    <label htmlFor="address1" className="label-text">
                      详细地址 <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="address1"
                      type="text"
                      autoComplete="address-line1"
                      className={inputClass("address1")}
                      placeholder="街道地址、门牌号"
                      value={form.address1}
                      onChange={(ev) => update("address1", ev.target.value)}
                    />
                    {errors.address1 && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                        <AlertCircle className="h-3.5 w-3.5" />
                        {errors.address1}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="address2" className="label-text">
                      详细地址第二行
                    </label>
                    <input
                      id="address2"
                      type="text"
                      autoComplete="address-line2"
                      className={inputClass("address2")}
                      placeholder="单元"
                      value={form.address2}
                      onChange={(ev) => update("address2", ev.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="country" className="label-text">
                        国家 <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="country"
                        type="text"
                        autoComplete="country-name"
                        className={inputClass("country")}
                        placeholder="例如：中国"
                        value={form.country}
                        onChange={(ev) => update("country", ev.target.value)}
                      />
                      {errors.country && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.country}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="city" className="label-text">
                        城市 <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="city"
                        type="text"
                        autoComplete="address-level2"
                        className={inputClass("city")}
                        placeholder="例如：上海"
                        value={form.city}
                        onChange={(ev) => update("city", ev.target.value)}
                      />
                      {errors.city && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.city}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="state" className="label-text">
                        省 <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="state"
                        type="text"
                        autoComplete="address-level1"
                        className={inputClass("state")}
                        placeholder="例如：浙江"
                        value={form.state}
                        onChange={(ev) => update("state", ev.target.value)}
                      />
                      {errors.state && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.state}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="zip" className="label-text">
                        邮政编码 <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="zip"
                        type="text"
                        autoComplete="postal-code"
                        className={inputClass("zip")}
                        placeholder="例如：00005"
                        value={form.zip}
                        onChange={(ev) => update("zip", ev.target.value)}
                      />
                      {errors.zip && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {errors.zip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 2. 项目与费用 */}
          <section className="space-y-6" aria-labelledby="section-program">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <FileText className="h-8 w-8 shrink-0 text-earth" aria-hidden />
              <h2 id="section-program" className="section-title">
                项目详情与费用明细
              </h2>
            </div>

            <div className="rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm md:p-8">
              <h3 className="font-serif text-[1.6875rem] font-semibold leading-snug text-earth">
                Peter Pan, Jr.
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-stone-700 md:text-base">
                <li>
                  <span className="text-stone-500">日期：</span>
                  6 月 15 日 – 6 月 26 日（周一至周五，6/19 放假）
                </li>
                <li>
                  <span className="text-stone-500">时间：</span>
                  9:15 AM – 3:15 PM
                </li>
                <li>
                  <span className="text-stone-500">演出时间：</span>
                  6/27 2:00 PM
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-[1.3125rem] font-medium text-stone-700">费用明细</h3>
              <div className="max-w-full overflow-x-auto rounded-lg border border-stone-200 bg-white [-webkit-overflow-scrolling:touch]">
                <table className="w-full min-w-0 table-fixed text-xs sm:text-sm md:text-base">
                  <colgroup>
                    <col className="w-[55%] sm:w-[60%]" />
                    <col className="w-[45%] sm:w-[40%]" />
                  </colgroup>
                  <tbody>
                    {[
                      ["营地学费", "$1,475.00"],
                      ["材料费", "$36.00"],
                      ["管理费", "$50.00"],
                    ].map(([label, amt]) => (
                      <tr key={label} className="border-b border-stone-100 last:border-0">
                        <td className="min-w-0 break-words px-3 py-2.5 text-stone-600 sm:px-4 sm:py-3 md:px-5">
                          {label}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-right font-medium tabular-nums text-stone-800 sm:px-4 sm:py-3 md:px-5">
                          {amt}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-stone-50/80">
                      <td className="min-w-0 break-words px-3 py-3 font-semibold text-stone-800 sm:px-4 md:px-5">
                        总计金额
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right font-serif text-base font-semibold text-earth sm:px-4 sm:text-lg md:px-5">
                        $1,561.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <fieldset>
              <legend className="form-legend-title">营地官网提供的支付选项</legend>
              <p className="mb-4 rounded-lg border border-earth/30 bg-earth/[0.08] px-3 py-2.5 text-sm font-bold leading-snug text-stone-900 sm:px-4 sm:text-base">
                中国境内支付方式可能被拒，信用卡还有3%手续费，可以转我人民币，我用美国卡支付
              </p>
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 transition-colors has-[:checked]:border-earth/40 has-[:checked]:bg-earth/[0.04]">
                  <input
                    type="radio"
                    name="payOption"
                    className="mt-1 accent-earth"
                    checked={form.payOption === "full"}
                    onChange={() => update("payOption", "full")}
                  />
                  <span className="text-sm text-stone-800">
                    <span className="font-medium">支付全款</span>
                    <span className="ml-2 text-earth">($1,561.00)</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-stone-200 bg-white p-4 transition-colors has-[:checked]:border-earth/40 has-[:checked]:bg-earth/[0.04]">
                  <input
                    type="radio"
                    name="payOption"
                    className="mt-1 accent-earth"
                    checked={form.payOption === "deposit"}
                    onChange={() => update("payOption", "deposit")}
                  />
                  <span className="text-sm text-stone-800">
                    <span className="font-medium">支付定金</span>
                    <span className="text-earth"> ($787.50)</span>
                    <span className="text-xs leading-snug text-stone-500 sm:text-sm">
                      ，剩余的全部尾款将会在接下来的 4 月 10 号 自动从绑定的支付方式中扣除
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
          </section>

          {/* 3. 退款政策 */}
          <section className="space-y-5" aria-labelledby="section-refund">
            <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
              <AlertCircle className="h-8 w-8 shrink-0 text-amber-700" aria-hidden />
              <h2 id="section-refund" className="section-title">
                退款政策与条款
              </h2>
            </div>

            <div className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-5 py-5 md:px-6 md:py-6">
              <ul className="list-inside list-disc space-y-2.5 text-sm text-stone-800 md:text-base">
                <li>开营前 14 天以上取消：退还 50% 学费及材料费。</li>
                <li>开营前 14 天内（含 14 天）取消：不予退款。</li>
                <li>注册费 / 管理费：任何情况下均不可退还。</li>
                <li>因个人原因缺课或从候补名单转入的情况，不按比例退费。</li>
                <li>若营地项目由校方主动取消，将提供全额退款。</li>
              </ul>
            </div>

            <div>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 accent-earth"
                  checked={form.policyAccepted}
                  onChange={(ev) => update("policyAccepted", ev.target.checked)}
                />
                <span className="text-sm text-stone-800">
                  我已阅读并同意上述退款政策与营地安排
                  <span className="text-red-600"> *</span>
                </span>
              </label>
              {errors.policyAccepted && (
                <p className="mt-2 flex items-center gap-1 text-xs text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" />
                  {errors.policyAccepted}
                </p>
              )}
            </div>
          </section>

          <footer className="border-t border-stone-200 pt-10">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-earth py-4 text-base font-medium text-white shadow-sm transition-colors hover:bg-earth-dark focus:outline-none focus:ring-2 focus:ring-earth focus:ring-offset-2 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 md:text-lg"
            >
              {isSubmitting ? "提交中…" : "提交报名信息"}
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
}
