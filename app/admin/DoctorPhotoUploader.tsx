'use client';

import { useEffect, useState } from 'react';
import { Check, ImagePlus, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp';

const errors: Record<string, string> = {
  too_large: 'Файл больше 8 МБ. Выберите фотографию меньшего размера.',
  unsupported_type: 'Поддерживаются JPG, PNG и WebP. HEIC нужно сначала сохранить как JPG.',
  invalid_image: 'Файл не распознан как фотография. Выберите другой JPG, PNG или WebP.',
  empty_file: 'Выбран пустой файл. Попробуйте другую фотографию.',
  signed_out: 'Сессия завершилась. Войдите в админ-панель ещё раз.',
  forbidden: 'Изменять фотографии может только администратор.',
  doctor_not_found: 'Профиль врача не найден. Обновите панель.',
  photo_changed: 'Фото уже изменилось в другой вкладке. Обновите панель и повторите попытку.',
  storage_unavailable: 'Хранилище фотографий ещё не подключено к опубликованной версии сайта.',
};

async function compressPhoto(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const candidate = new Image();
      candidate.onload = () => resolve(candidate);
      candidate.onerror = () => reject(new Error(errors.invalid_image));
      candidate.src = objectUrl;
    });
    const maxSide = 1200;
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error(errors.invalid_image);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    if (dataUrl.length > 2_200_000) throw new Error('Фото слишком большое для демо-режима. Выберите фотографию меньшего размера.');
    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function DoctorPhotoUploader({ slug, name, disabled, onUploaded, onBusyChange }: {
  slug: string;
  name: string;
  disabled: boolean;
  onUploaded: (imageUrl: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!file) { setPreviewUrl(''); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function selectFile(candidate: File | undefined) {
    if (!candidate) return;
    setError(''); setSaved(false); setReady(false);
    if (!PHOTO_ACCEPT.split(',').includes(candidate.type)) { setFile(null); setError(errors.unsupported_type); return; }
    if (!candidate.size) { setFile(null); setError(errors.empty_file); return; }
    if (candidate.size > MAX_PHOTO_BYTES) { setFile(null); setError(errors.too_large); return; }
    setFile(candidate);
  }

  async function upload() {
    if (!file || !ready || busy || disabled) return;
    setBusy(true); onBusyChange(true); setError(''); setSaved(false);
    try {
      const imageUrl = await compressPhoto(file);
      onUploaded(imageUrl);
      setFile(null); setReady(false); setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Не удалось загрузить фото. Попробуйте ещё раз.');
    } finally { setBusy(false); onBusyChange(false); }
  }

  return <div className="admin-photo-upload" aria-busy={busy}>
    <label className="admin-photo-label" htmlFor={'photo-' + slug}><ImagePlus /> Фотография врача</label>
    <p>Выберите фото с телефона или компьютера. В демо-режиме оно сохранится в этом браузере.</p>
    <Input id={'photo-' + slug} type="file" accept={PHOTO_ACCEPT} disabled={busy || disabled} aria-label={'Выбрать фотографию: ' + name} aria-describedby={'photo-hint-' + slug} onChange={(event) => { selectFile(event.target.files?.[0]); event.target.value = ''; }} />
    <small id={'photo-hint-' + slug}>JPG, PNG или WebP · до 8 МБ. Только фотографии для публикации на сайте.</small>
    {file && previewUrl && <div className="admin-photo-preview">
      <img key={previewUrl} src={previewUrl} alt={'Новая фотография: ' + name} onLoad={() => setReady(true)} onError={() => { setReady(false); setFile(null); setError(errors.invalid_image); }} />
      <div><strong>{file.name}</strong><small>{(file.size / 1024 / 1024).toFixed(1)} МБ · {ready ? 'Готово к сохранению' : 'Проверяем изображение…'}</small>
        <div className="admin-photo-actions"><Button className="admin-save" disabled={!ready || busy || disabled} onClick={() => void upload()}>{busy ? <Loader2 className="spinner" /> : <Upload />}{busy ? 'Загружаем…' : 'Сохранить фото'}</Button><Button variant="outline" disabled={busy || disabled} onClick={() => { setFile(null); setReady(false); setError(''); }}><X /> Отмена</Button></div>
      </div>
    </div>}
    {error && <p className="admin-photo-error" role="alert">{error}</p>}
    {saved && <p className="admin-photo-success" role="status"><Check /> Фото сохранено в этом браузере — оно используется в карточке и профиле врача.</p>}
  </div>;
}
