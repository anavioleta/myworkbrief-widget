import { AVATARS } from './avatars'
import { PLACEHOLDER_IMG } from './placeholder-img'
import { STATUS_ICONS, LINK_ICON } from './status-icons'

const { widget } = figma
const {
  useSyncedState,
  usePropertyMenu,
  AutoLayout,
  Text,
  Input,
  Rectangle,
  Image,
  SVG,
} = widget

type Theme = 'light' | 'dark'
type TaskType = 'UI' | 'UX' | 'CRO'
type Status = 'none' | 'Paused' | 'In progress' | 'Archived' | 'Shipped'

const CARD_W = 600
const PADDING = 32
const GAP = 24

const DESIGNERS = [
  { key: 'none', name: '', role: '' },
  { key: 'violeta', name: 'Violeta Hernández', role: 'UI Designer' },
  { key: 'daniel', name: 'Daniel Cebrian', role: 'UI Designer' },
  { key: 'fatima', name: 'Fatima Castilla', role: 'UX Designer' },
  { key: 'carlos', name: 'Carlos Aguilera', role: 'UX Designer' },
  { key: 'teresa', name: 'Teresa P\u00E9rez', role: 'CRO Specialist' },
  { key: 'beatriz', name: 'Beatriz Saenz', role: 'Designer' },
  { key: 'pascal', name: 'Pascal Marín', role: 'Designer' },
]

function toHexSafe(hex: string, fallbackHex: string): string {
  const raw = (hex ?? '').trim().replace('#', '')
  const fb = (fallbackHex ?? '000000').trim().replace('#', '')
  const valid = /^[0-9a-fA-F]{6}$/.test(raw) ? raw : (/^[0-9a-fA-F]{6}$/.test(fb) ? fb : '000000')
  return '#' + valid
}

function tokens(theme: Theme) {
  const light = theme === 'light' || theme !== 'dark'
  return {
    cardBg: light ? 'FFFFFF' : '0B1220',
    cardBorder: light ? 'CDD5DF' : '475569',
    divider: light ? 'D9D9D9' : '1E293B',
    title: light ? '364152' : 'E2E8F0',
    body: light ? '697586' : 'A3B1C6',
    label: light ? '697586' : 'A3B1C6',
    value: light ? '2C3947' : 'E2E8F0',
    fieldBg: light ? 'F9FAFB' : '111B2E',
    fieldBorder: light ? 'CDD5DF' : '334155',
    fieldText: light ? '697586' : 'A3B1C6',
  }
}

const TASK_STYLES: Record<TaskType, { fill: string; text: string; label: string }> = {
  UI: { fill: 'E3B2FB', text: '885E9D', label: 'UI  Task' },
  UX: { fill: '51C2E5', text: '136881', label: 'UX Task' },
  CRO: { fill: '5ED8B1', text: '1A6B51', label: 'CRO Task' },
}

const STATUS_STYLES: Record<Exclude<Status, 'none'>, { bg: string; fg: string; label: string }> = {
  Paused: { bg: 'FFB199', fg: '913D3D', label: 'Paused' },
  'In progress': { bg: 'FFD999', fg: '6C5638', label: 'In progress' },
  Archived: { bg: 'D8DEE2', fg: '747B81', label: 'Archived' },
  Shipped: { bg: '99E5DB', fg: '3B786F', label: 'Shipped' },
}

function TaskCard() {
  const [theme, setTheme] = useSyncedState<Theme>('theme', 'light')
  const [editMode, setEditMode] = useSyncedState('editMode', false)
  const [taskType, setTaskType] = useSyncedState<TaskType>('taskType', 'UI')
  const [status, setStatus] = useSyncedState<Status>('status', 'none')
  const [includeInTizona, setIncludeInTizona] = useSyncedState<boolean | null>('includeInTizona', null)
  const [title, setTitle] = useSyncedState('title', '')
  const [description, setDescription] = useSyncedState('description', '')
  const [createdDate, setCreatedDate] = useSyncedState('createdDate', '')
  const [productManager, setProductManager] = useSyncedState('productManager', '')
  const [jiraUrl, setJiraUrl] = useSyncedState('jiraUrl', '')
  const [uiUrl, setUiUrl] = useSyncedState('uiUrl', '')
  const [uxUrl, setUxUrl] = useSyncedState('uxUrl', '')
  const [designerKey, setDesignerKey] = useSyncedState<string>('designerKey', 'none')

  const t = tokens(theme)
  const FB = 'FFFFFF'

  usePropertyMenu(
    [
      {
        itemType: 'toggle',
        propertyName: 'editMode',
        tooltip: editMode ? 'Cerrar edicion' : 'Editar',
        isToggled: editMode,
      },
      { itemType: 'separator' },
      {
        itemType: 'dropdown',
        propertyName: 'theme',
        tooltip: 'Tema',
        selectedOption: theme,
        options: [
          { option: 'light', label: 'Light' },
          { option: 'dark', label: 'Dark' },
        ],
      },
      { itemType: 'separator' },
      {
        itemType: 'dropdown',
        propertyName: 'taskType',
        tooltip: 'Task Type',
        selectedOption: taskType,
        options: [
          { option: 'UI', label: 'UI Task' },
          { option: 'UX', label: 'UX Task' },
          { option: 'CRO', label: 'CRO Task' },
        ],
      },
      { itemType: 'separator' },
      {
        itemType: 'dropdown',
        propertyName: 'status',
        tooltip: 'Status',
        selectedOption: status,
        options: [
          { option: 'none', label: 'None' },
          { option: 'Paused', label: 'Paused' },
          { option: 'In progress', label: 'In progress' },
          { option: 'Archived', label: 'Archived' },
          { option: 'Shipped', label: 'Shipped' },
        ],
      },
      { itemType: 'separator' },
      {
        itemType: 'dropdown',
        propertyName: 'designer',
        tooltip: 'Owner',
        selectedOption: designerKey,
        options: DESIGNERS.map((d) => ({ option: d.key, label: d.key === 'none' ? 'None' : d.name })),
      },
    ],
    (e) => {
      if (e.propertyName === 'editMode') setEditMode(!editMode)
      if (e.propertyName === 'theme' && e.propertyValue) setTheme(e.propertyValue as Theme)
      if (e.propertyName === 'taskType' && e.propertyValue) setTaskType(e.propertyValue as TaskType)
      if (e.propertyName === 'status' && e.propertyValue) setStatus(e.propertyValue as Status)
      if (e.propertyName === 'designer' && e.propertyValue) setDesignerKey(e.propertyValue)
    },
  )

  const handleSave = () => {
    if (!title || !title.trim()) {
      figma.notify('Title is required')
      return
    }
    setEditMode(false)
    figma.notify('Cambios guardados')
  }

  const inputFrame = () => ({
    fill: toHexSafe(t.fieldBg, FB),
    cornerRadius: 10,
    padding: 12,
    stroke: toHexSafe(t.fieldBorder, FB),
    strokeWidth: 1,
  })

  const inputFrameDescription = () => ({
    ...inputFrame(),
    padding: { top: 16, right: 16, bottom: 16, left: 16 },
    height: 80,
  })

  if (editMode) {
    const d = DESIGNERS.find((x) => x.key === designerKey)
    return (
      <AutoLayout
        direction="vertical"
        width={CARD_W}
        cornerRadius={32}
        overflow="hidden"
        stroke={toHexSafe(t.cardBorder, FB)}
        strokeWidth={1}
        fill={toHexSafe(t.cardBg, FB)}
      >
        <AutoLayout
          width="fill-parent"
          height={50}
          fill={toHexSafe(TASK_STYLES[taskType]?.fill ?? 'E3B2FB', FB)}
          horizontalAlignItems="center"
          verticalAlignItems="center"
        >
          <Text fontSize={16} fontWeight={600} fill={toHexSafe(TASK_STYLES[taskType]?.text ?? '885E9D', FB)}>
            {TASK_STYLES[taskType]?.label ?? 'UI  Task'}
          </Text>
        </AutoLayout>
        <AutoLayout direction="vertical" width="fill-parent" padding={PADDING} spacing={GAP}>
          <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Title *</Text>
            <Input
              value={title}
              onTextEditEnd={(ev) => setTitle(ev.characters)}
              placeholder="Añade el título..."
              fontSize={14}
              fill={toHexSafe(t.fieldText, FB)}
              width="fill-parent"
              inputFrameProps={inputFrame()}
            />
          </AutoLayout>
          <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
            <AutoLayout direction="horizontal" width="fill-parent" verticalAlignItems="center">
              <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Description</Text>
              <AutoLayout width="fill-parent" height={1} />
              <Text fontSize={12} fill={toHexSafe(t.label, FB)}>{(description || '').length}/350</Text>
            </AutoLayout>
            <Input
              value={(description || '').slice(0, 350)}
              onTextEditEnd={(ev) => setDescription((ev.characters || '').slice(0, 350))}
              placeholder="Añade la descripción breve del proyecto..."
              fontSize={14}
              fill={toHexSafe(t.fieldText, FB)}
              width="fill-parent"
              height={80}
              inputBehavior="multiline"
              inputFrameProps={inputFrameDescription()}
            />
          </AutoLayout>
          <AutoLayout direction="horizontal" width="fill-parent" spacing={GAP}>
            <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
              <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Fecha de creación</Text>
              <Input
                value={createdDate}
                onTextEditEnd={(ev) => setCreatedDate(ev.characters)}
                placeholder="dd/mm/yyyy"
                fontSize={14}
                fill={toHexSafe(t.fieldText, FB)}
                width="fill-parent"
                inputFrameProps={inputFrame()}
              />
            </AutoLayout>
            <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
              <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Product manager</Text>
              <Input
                value={productManager}
                onTextEditEnd={(ev) => setProductManager(ev.characters)}
                placeholder="Nombre"
                fontSize={14}
                fill={toHexSafe(t.fieldText, FB)}
                width="fill-parent"
                inputFrameProps={inputFrame()}
              />
            </AutoLayout>
          </AutoLayout>
          <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Jira URL</Text>
            <Input
              value={jiraUrl}
              onTextEditEnd={(ev) => setJiraUrl(ev.characters)}
              placeholder="https://..."
              fontSize={14}
              fill={toHexSafe(t.fieldText, FB)}
              width="fill-parent"
              inputFrameProps={inputFrame()}
            />
          </AutoLayout>
          <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={14} fill={toHexSafe(t.label, FB)}>UI URL</Text>
            <Input
              value={uiUrl}
              onTextEditEnd={(ev) => setUiUrl(ev.characters)}
              placeholder="https://..."
              fontSize={14}
              fill={toHexSafe(t.fieldText, FB)}
              width="fill-parent"
              inputFrameProps={inputFrame()}
            />
          </AutoLayout>
          <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={14} fill={toHexSafe(t.label, FB)}>UX URL</Text>
            <Input
              value={uxUrl}
              onTextEditEnd={(ev) => setUxUrl(ev.characters)}
              placeholder="https://..."
              fontSize={14}
              fill={toHexSafe(t.fieldText, FB)}
              width="fill-parent"
              inputFrameProps={inputFrame()}
            />
          </AutoLayout>
          <AutoLayout direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={12} fill={toHexSafe(t.body, FB)}>Owner: {(d && d.name) || 'Ninguno'} (cambiar desde el menu)</Text>
          </AutoLayout>
          <AutoLayout direction="horizontal" width="fill-parent" verticalAlignItems="center" spacing={GAP}>
            <AutoLayout
              direction="horizontal"
              spacing={10}
              verticalAlignItems="center"
              onClick={() => setIncludeInTizona(includeInTizona === true ? false : true)}
            >
              <AutoLayout
                width={20}
                height={20}
                cornerRadius={4}
                fill={includeInTizona === true ? toHexSafe('01A3FF', FB) : toHexSafe(t.fieldBg, FB)}
                stroke={toHexSafe(includeInTizona === true ? '01A3FF' : t.fieldBorder, FB)}
                strokeWidth={1}
                horizontalAlignItems="center"
                verticalAlignItems="center"
              >
                {includeInTizona === true && (
                  <Text fontSize={12} fontWeight={700} fill={toHexSafe('FFFFFF', FB)}>✓</Text>
                )}
              </AutoLayout>
              <Text fontSize={14} fill={toHexSafe(t.value, FB)}>Añadir a Tizona</Text>
            </AutoLayout>
            <AutoLayout width="fill-parent" height={1} />
            <AutoLayout
              padding={{ vertical: 14, horizontal: 24 }}
              cornerRadius={10}
              fill={toHexSafe('01A3FF', FB)}
              horizontalAlignItems="center"
              verticalAlignItems="center"
              onClick={handleSave}
            >
              <Text fontSize={14} fontWeight={600} fill={toHexSafe('FFFFFF', FB)}>Guardar cambios</Text>
            </AutoLayout>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    )
  }

  const isEmpty = !title || !title.trim()
  if (isEmpty) {
    return (
      <AutoLayout
        direction="vertical"
        width={CARD_W}
        height={400}
        cornerRadius={32}
        overflow="hidden"
        stroke={toHexSafe(t.cardBorder, FB)}
        strokeWidth={1}
        fill={toHexSafe('FFFFFF', FB)}
        horizontalAlignItems="center"
        verticalAlignItems="center"
        spacing={32}
        padding={48}
      >
        <AutoLayout direction="vertical" spacing={20} horizontalAlignItems="center">
          <Image src={PLACEHOLDER_IMG} width={140} height={140} />
          <Text fontSize={18} fontWeight={500} fill={toHexSafe(t.value, FB)}>
            Añade tu trabajo para compartir con el equipo
          </Text>
        </AutoLayout>
        <AutoLayout
          padding={{ vertical: 14, horizontal: 24 }}
          cornerRadius={10}
          fill={toHexSafe('01A3FF', FB)}
          horizontalAlignItems="center"
          verticalAlignItems="center"
          onClick={() => setEditMode(true)}
        >
          <Text fontSize={14} fontWeight={600} fill={toHexSafe('FFFFFF', FB)}>Add My Work Brief</Text>
        </AutoLayout>
      </AutoLayout>
    )
  }

  const hasMain = !!(title && title.trim())
  const hasDesc = !!(description && description.trim())
  const hasMetadata =
    !!(createdDate && createdDate.trim()) ||
    !!(productManager && productManager.trim()) ||
    includeInTizona === true ||
    !!(jiraUrl && jiraUrl.trim()) ||
    !!(uiUrl && uiUrl.trim()) ||
    !!(uxUrl && uxUrl.trim())
  const hasDesigner = !!designerKey && designerKey !== 'none'

  const metadataRows: Array<{ label: string; value: string | FigmaDeclarativeNode }> = []
  if (createdDate && createdDate.trim()) metadataRows.push({ label: 'Fecha de creación', value: createdDate })
  if (productManager && productManager.trim()) metadataRows.push({ label: 'Product manager', value: productManager })
  if (includeInTizona === true) metadataRows.push({ label: 'Incluir en Tizona', value: 'Si' })
  if (jiraUrl && jiraUrl.trim())
    metadataRows.push({
      label: 'Jira URL',
      value: (
        <AutoLayout
          direction="horizontal"
          height={36}
          padding={{ vertical: 0, horizontal: 16 }}
          cornerRadius={8}
          fill={toHexSafe('01A3FF', FB)}
          horizontalAlignItems="center"
          verticalAlignItems="center"
          spacing={8}
          onClick={() => figma.openExternal(jiraUrl)}
        >
          <SVG src={LINK_ICON} width={16} height={16} />
          <Text fontSize={16} fontWeight={500} fill={toHexSafe('FFFFFF', FB)}>Visitar Jira</Text>
        </AutoLayout>
      ),
    })
  if (uiUrl && uiUrl.trim())
    metadataRows.push({
      label: 'UI URL',
      value: (
        <AutoLayout
          direction="horizontal"
          height={36}
          padding={{ vertical: 0, horizontal: 16 }}
          cornerRadius={8}
          fill={toHexSafe('01A3FF', FB)}
          horizontalAlignItems="center"
          verticalAlignItems="center"
          spacing={8}
          onClick={() => figma.openExternal(uiUrl)}
        >
          <SVG src={LINK_ICON} width={16} height={16} />
          <Text fontSize={16} fontWeight={500} fill={toHexSafe('FFFFFF', FB)}>Visitar UI</Text>
        </AutoLayout>
      ),
    })
  if (uxUrl && uxUrl.trim())
    metadataRows.push({
      label: 'UX URL',
      value: (
        <AutoLayout
          direction="horizontal"
          height={36}
          padding={{ vertical: 0, horizontal: 16 }}
          cornerRadius={8}
          fill={toHexSafe('01A3FF', FB)}
          horizontalAlignItems="center"
          verticalAlignItems="center"
          spacing={8}
          onClick={() => figma.openExternal(uxUrl)}
        >
          <SVG src={LINK_ICON} width={16} height={16} />
          <Text fontSize={16} fontWeight={500} fill={toHexSafe('FFFFFF', FB)}>Visitar UX</Text>
        </AutoLayout>
      ),
    })

  const d = DESIGNERS.find((x) => x.key === designerKey && x.key !== 'none')
  const hasStatus = status !== undefined && status !== null && status !== '' && status !== 'none'
  const st = hasStatus && STATUS_STYLES[status] ? STATUS_STYLES[status] : null

  const showDivBeforeMeta = (hasMain || hasDesc) && hasMetadata
  const hasFooter = hasDesigner || hasStatus
  const showDivBeforeFooter = (hasMain || hasDesc || hasMetadata) && hasFooter

  return (
    <AutoLayout
      direction="vertical"
      width={CARD_W}
      cornerRadius={32}
      overflow="hidden"
      stroke={toHexSafe(t.cardBorder, FB)}
      strokeWidth={1}
      fill={toHexSafe(t.cardBg, FB)}
    >
      <AutoLayout
        width="fill-parent"
        height={50}
        fill={toHexSafe(TASK_STYLES[taskType]?.fill ?? 'E3B2FB', FB)}
        horizontalAlignItems="center"
        verticalAlignItems="center"
      >
        <Text fontSize={16} fontWeight={600} fill={toHexSafe(TASK_STYLES[taskType]?.text ?? '885E9D', FB)}>
          {TASK_STYLES[taskType]?.label ?? 'UI  Task'}
        </Text>
      </AutoLayout>
      <AutoLayout direction="vertical" width="fill-parent" padding={PADDING} spacing={GAP}>
        {hasMain && (
          <Text fontSize={34} fontWeight={600} fill={toHexSafe(t.title, FB)} width="fill-parent">
            {title}
          </Text>
        )}
        {hasDesc && (
          <Text fontSize={16} fontWeight={400} fill={toHexSafe(t.body, FB)} width="fill-parent">
            {description}
          </Text>
        )}
        {showDivBeforeMeta && (
          <Rectangle width="fill-parent" height={1} fill={toHexSafe(t.divider, FB)} />
        )}
        {metadataRows.length > 0 && (
          <AutoLayout direction="vertical" width="fill-parent" spacing={16}>
            {metadataRows.map((r) => (
              <AutoLayout key={r.label} direction="horizontal" width="fill-parent" verticalAlignItems="center">
                <Text fontSize={16} fontWeight={400} fill={toHexSafe(t.label, FB)}>{r.label}</Text>
                <AutoLayout width="fill-parent" height={1} />
                {typeof r.value === 'string' ? (
                  <Text fontSize={16} fontWeight={400} fill={toHexSafe(t.value, FB)}>{r.value}</Text>
                ) : (
                  r.value
                )}
              </AutoLayout>
            ))}
          </AutoLayout>
        )}
        {showDivBeforeFooter && (
          <Rectangle width="fill-parent" height={1} fill={toHexSafe(t.divider, FB)} />
        )}
        {hasFooter && (
        <AutoLayout direction="horizontal" width="fill-parent" verticalAlignItems="center">
          {hasDesigner && d && (
            <AutoLayout direction="horizontal" spacing={16} verticalAlignItems="center">
              {AVATARS[d.key] ? (
                <>
                  <Image src={AVATARS[d.key]} width={54} height={54} cornerRadius={27} />
                  <AutoLayout direction="vertical" spacing={2}>
                    <Text fontSize={14} fontWeight={400} fill={toHexSafe(t.label, FB)}>{d.role}</Text>
                    <Text fontSize={16} fontWeight={400} fill={toHexSafe(t.value, FB)}>{d.name}</Text>
                  </AutoLayout>
                </>
              ) : (
                <>
                  <AutoLayout
                    width={54}
                    height={54}
                    cornerRadius={27}
                    fill={toHexSafe('64748B', FB)}
                    horizontalAlignItems="center"
                    verticalAlignItems="center"
                  >
                    <Text fontSize={18} fontWeight={700} fill={toHexSafe('FFFFFF', FB)}>
                      {d.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
                    </Text>
                  </AutoLayout>
                  <AutoLayout direction="vertical" spacing={2}>
                    <Text fontSize={14} fontWeight={400} fill={toHexSafe(t.label, FB)}>{d.role}</Text>
                    <Text fontSize={16} fontWeight={400} fill={toHexSafe(t.value, FB)}>{d.name}</Text>
                  </AutoLayout>
                </>
              )}
            </AutoLayout>
          )}
          <AutoLayout width="fill-parent" height={1} />
          {hasStatus && st && (
          <AutoLayout
            direction="horizontal"
            height={36}
            padding={{ vertical: 0, horizontal: 12 }}
            cornerRadius={100}
            fill={toHexSafe(st.bg, FB)}
            horizontalAlignItems="center"
            verticalAlignItems="center"
            spacing={8}
          >
            {STATUS_ICONS[status] && (
              <SVG src={STATUS_ICONS[status]} width={18} height={18} />
            )}
            <Text fontSize={14} fontWeight={600} fill={toHexSafe(st.fg, FB)}>{st.label}</Text>
          </AutoLayout>
          )}
        </AutoLayout>
        )}
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(TaskCard)
