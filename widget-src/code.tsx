import { STATUS_ICONS, LINK_ICON } from './status-icons'

function getInitials(name: string): string {
  const s = (name || '').trim()
  if (!s) return 'NA'
  const words = s.split(/\s+/).filter(Boolean)
  if (words.length >= 2) {
    const first = words[0][0] || ''
    const last = words[words.length - 1][0] || ''
    return (first + last).toUpperCase()
  }
  return (words[0].slice(0, 2) || 'NA').toUpperCase()
}

const { widget } = figma
const {
  useSyncedState,
  usePropertyMenu,
  AutoLayout,
  Text,
  Input,
  Rectangle,
  SVG,
} = widget

type Theme = 'light' | 'dark'
type TaskType = 'UI' | 'UX' | 'CRO'
type Status = 'none' | 'Paused' | 'In progress' | 'Archived' | 'Shipped'

const uiTokens = {
  cardW: 600,
  padding: 32,
  gap: 24,
  gapMeta: 16,
  radius: 32,
  radiusBtn: 8,
  radiusPill: 100,
  headerH: 50,
  btnH: 36,
  avatarSize: 54,
} as const

const CARD_W = uiTokens.cardW
const PADDING = uiTokens.padding
const GAP = uiTokens.gap

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
    btnDefault: light ? 'CDD5DF' : '475569',
    btnDefaultText: 'FFFFFF',
    avatarPlaceholder: light ? '64748B' : '475569',
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

function DefaultWidget() {
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
  const [assignedTo, setAssignedTo] = useSyncedState('assignedTo', '')
  const [hasBeenEdited, setHasBeenEdited] = useSyncedState('hasBeenEdited', false)

  const t = tokens(theme)
  const FB = 'FFFFFF'

  usePropertyMenu(
    [
      {
        itemType: 'toggle',
        propertyName: 'editMode',
        tooltip: editMode ? 'Close edit' : 'Edit',
        isToggled: editMode,
      },
      { itemType: 'separator' },
      {
        itemType: 'dropdown',
        propertyName: 'theme',
        tooltip: 'Theme',
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
    ],
    (e) => {
      if (e.propertyName === 'editMode') setEditMode(!editMode)
      if (e.propertyName === 'theme' && e.propertyValue) setTheme(e.propertyValue as Theme)
      if (e.propertyName === 'taskType' && e.propertyValue) setTaskType(e.propertyValue as TaskType)
      if (e.propertyName === 'status' && e.propertyValue) setStatus(e.propertyValue as Status)
    },
  )

  const handleSave = () => {
    if (!title || !title.trim()) {
      figma.notify('Title is required')
      return
    }
    setHasBeenEdited(true)
    setEditMode(false)
    figma.notify('Changes saved')
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
    return (
      <AutoLayout
        name="Task Card"
        direction="vertical"
        width={CARD_W}
        cornerRadius={32}
        overflow="hidden"
        stroke={toHexSafe(t.cardBorder, FB)}
        strokeWidth={1}
        fill={toHexSafe(t.cardBg, FB)}
      >
        <AutoLayout
          name="Header / Type Badge"
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
        <AutoLayout name="Form" direction="vertical" width="fill-parent" padding={PADDING} spacing={GAP}>
          <AutoLayout name="Form / Title Field" direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Title *</Text>
            <Input
              value={title}
              onTextEditEnd={(ev) => setTitle(ev.characters)}
              placeholder="Add the title..."
              fontSize={14}
              fill={toHexSafe(t.value, FB)}
              width="fill-parent"
              inputFrameProps={inputFrame()}
            />
          </AutoLayout>
          <AutoLayout name="Form / Description Field" direction="vertical" width="fill-parent" spacing={8}>
            <AutoLayout name="Form / Description Label Row" direction="horizontal" width="fill-parent" verticalAlignItems="center">
              <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Description</Text>
              <AutoLayout name="Form / Description Label Row / Spacer" width="fill-parent" height={1} />
              <Text fontSize={12} fill={toHexSafe(t.label, FB)}>{(description || '').length}/350</Text>
            </AutoLayout>
            <Input
              value={(description || '').slice(0, 350)}
              onTextEditEnd={(ev) => setDescription((ev.characters || '').slice(0, 350))}
              placeholder="Add a brief project description..."
              fontSize={14}
              fill={toHexSafe(t.value, FB)}
              width="fill-parent"
              height={80}
              inputBehavior="multiline"
              inputFrameProps={inputFrameDescription()}
            />
          </AutoLayout>
          <AutoLayout name="Form / Meta Row" direction="horizontal" width="fill-parent" spacing={GAP}>
            <AutoLayout name="Form / Created Date Field" direction="vertical" width="fill-parent" spacing={8}>
              <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Creation date</Text>
              <Input
                value={createdDate}
                onTextEditEnd={(ev) => setCreatedDate(ev.characters)}
                placeholder="dd/mm/yyyy"
                fontSize={14}
                fill={toHexSafe(t.value, FB)}
                width="fill-parent"
                inputFrameProps={inputFrame()}
              />
            </AutoLayout>
            <AutoLayout name="Form / Product Manager Field" direction="vertical" width="fill-parent" spacing={8}>
              <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Product manager</Text>
              <Input
                value={productManager}
                onTextEditEnd={(ev) => setProductManager(ev.characters)}
                placeholder="Name"
                fontSize={14}
                fill={toHexSafe(t.value, FB)}
                width="fill-parent"
                inputFrameProps={inputFrame()}
              />
            </AutoLayout>
          </AutoLayout>
          <AutoLayout name="Form / Jira Field" direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Jira URL</Text>
            <Input
              value={jiraUrl}
              onTextEditEnd={(ev) => setJiraUrl(ev.characters)}
              placeholder="https://..."
              fontSize={14}
              fill={toHexSafe(t.value, FB)}
              width="fill-parent"
              inputFrameProps={inputFrame()}
            />
          </AutoLayout>
          <AutoLayout name="Form / UI URL Field" direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={14} fill={toHexSafe(t.label, FB)}>UI URL</Text>
            <Input
              value={uiUrl}
              onTextEditEnd={(ev) => setUiUrl(ev.characters)}
              placeholder="https://..."
              fontSize={14}
              fill={toHexSafe(t.value, FB)}
              width="fill-parent"
              inputFrameProps={inputFrame()}
            />
          </AutoLayout>
          <AutoLayout name="Form / UX URL Field" direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={14} fill={toHexSafe(t.label, FB)}>UX URL</Text>
            <Input
              value={uxUrl}
              onTextEditEnd={(ev) => setUxUrl(ev.characters)}
              placeholder="https://..."
              fontSize={14}
              fill={toHexSafe(t.value, FB)}
              width="fill-parent"
              inputFrameProps={inputFrame()}
            />
          </AutoLayout>
          <AutoLayout name="Form / Assigned To Field" direction="vertical" width="fill-parent" spacing={8}>
            <Text fontSize={14} fill={toHexSafe(t.label, FB)}>Assigned to</Text>
            <Input
              value={assignedTo}
              onTextEditEnd={(ev) => setAssignedTo(ev.characters)}
              placeholder="Name of assignee"
              fontSize={14}
              fill={toHexSafe(t.value, FB)}
              width="fill-parent"
              inputFrameProps={inputFrame()}
            />
          </AutoLayout>
          <AutoLayout name="Form / Actions" direction="horizontal" width="fill-parent" verticalAlignItems="center" spacing={GAP}>
            <AutoLayout
              name="Form / Toggle Group"
              direction="horizontal"
              spacing={10}
              verticalAlignItems="center"
              onClick={() => setIncludeInTizona(includeInTizona === true ? false : true)}
            >
              <AutoLayout
                name="Form / Toggle Group / Checkbox"
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
              <Text fontSize={14} fill={toHexSafe(t.value, FB)}>Include in the Design System</Text>
            </AutoLayout>
            <AutoLayout name="Form / Actions / Spacer" width="fill-parent" height={1} />
            <AutoLayout
              name="Form / Actions / Save Button"
              padding={{ vertical: 14, horizontal: 24 }}
              cornerRadius={10}
              fill={toHexSafe('01A3FF', FB)}
              horizontalAlignItems="center"
              verticalAlignItems="center"
              onClick={handleSave}
            >
              <Text fontSize={14} fontWeight={600} fill={toHexSafe('FFFFFF', FB)}>Save changes</Text>
            </AutoLayout>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    )
  }

  const displayTitle = (title && title.trim()) || "Here's where your super awesome title goes"
  const hasDesc = !!(description && description.trim())
  const displayDesc =
    hasDesc ? (description || '').trim() :
    `Ahh. Well, ma, we talked about this, we're not gonna go to the lake, the car's wrecked. Listen, Doc. Uh, I think so. Weight has nothing to do with it.`
  const displayDate = (createdDate && createdDate.trim()) || 'dd/mm/yyy'
  const displayPM = (productManager && productManager.trim()) || 'Name of product manager'

  const linkBtn = (url: string, label: string, name: string) =>
    url && url.trim() ? (
      <AutoLayout
        name={name}
        direction="horizontal"
        height={uiTokens.btnH}
        padding={{ vertical: 6, horizontal: 16 }}
        cornerRadius={uiTokens.radiusBtn}
        fill={toHexSafe('01A3FF', FB)}
        horizontalAlignItems="center"
        verticalAlignItems="center"
        spacing={10}
        onClick={() => figma.openExternal(url)}
      >
        <SVG src={LINK_ICON} width={18} height={18} />
        <Text fontSize={16} fontWeight={500} fill={toHexSafe('FFFFFF', FB)}>
          {label}
        </Text>
      </AutoLayout>
    ) : (
      <AutoLayout
        name={name}
        direction="horizontal"
        height={uiTokens.btnH}
        padding={{ vertical: 6, horizontal: 16 }}
        cornerRadius={uiTokens.radiusBtn}
        fill={toHexSafe(t.btnDefault, FB)}
        horizontalAlignItems="center"
        verticalAlignItems="center"
        spacing={10}
      >
        <SVG src={LINK_ICON} width={18} height={18} />
        <Text fontSize={16} fontWeight={500} fill={toHexSafe(t.btnDefaultText, FB)}>
          {label}
        </Text>
      </AutoLayout>
    )

  const showField = (value: string) => !hasBeenEdited || (!!value && !!value.trim())
  const metadataRows: Array<{ label: string; value: string | FigmaDeclarativeNode }> = []
  if (showField(createdDate)) metadataRows.push({ label: 'Creation date', value: displayDate })
  if (showField(productManager)) metadataRows.push({ label: 'Product manager', value: displayPM })
  if (includeInTizona === true) metadataRows.push({ label: 'Include in the Design System', value: 'Yes' })
  if (showField(jiraUrl)) metadataRows.push({ label: 'Jira URL', value: linkBtn(jiraUrl, 'Visit Jira', 'Metadata / Jira / Link') })
  if (showField(uxUrl)) metadataRows.push({ label: 'UX URL prototype', value: linkBtn(uxUrl, 'Visit UX prototype', 'Metadata / UX URL / Link') })

  const hasAssigned = !!(assignedTo && assignedTo.trim())
  const assignedName = hasAssigned ? (assignedTo || '').trim() : 'Unassigned'
  const showAssigned = !hasBeenEdited || hasAssigned
  const hasStatus = status !== undefined && status !== null && status !== '' && status !== 'none'
  const st = hasStatus && STATUS_STYLES[status] ? STATUS_STYLES[status] : null
  const light = theme === 'light' || theme !== 'dark'
  const avatarSlate = light
    ? { bg: 'E2E8F0', border: 'CBD5E1', initials: '334155' }
    : { bg: '1E293B', border: '334155', initials: 'E2E8F0' }

  return (
    <AutoLayout
      name="Task Card"
      direction="vertical"
      width={CARD_W}
      cornerRadius={32}
      overflow="hidden"
      stroke={toHexSafe(t.cardBorder, FB)}
      strokeWidth={1}
      fill={toHexSafe(t.cardBg, FB)}
    >
      <AutoLayout
        name="Header / Type Badge"
        width="fill-parent"
        height={uiTokens.headerH}
        fill={toHexSafe(TASK_STYLES[taskType]?.fill ?? 'E3B2FB', FB)}
        horizontalAlignItems="center"
        verticalAlignItems="center"
      >
        <Text fontSize={16} fontWeight={600} fill={toHexSafe(TASK_STYLES[taskType]?.text ?? '885E9D', FB)}>
          {TASK_STYLES[taskType]?.label ?? 'UI  Task'}
        </Text>
      </AutoLayout>
      <AutoLayout name="Content" direction="vertical" width="fill-parent" padding={PADDING} spacing={GAP}>
        <Text name="Content / Title" fontSize={34} fontWeight={600} fill={toHexSafe(t.title, FB)} width="fill-parent">
          {displayTitle}
        </Text>
        {(!hasBeenEdited || hasDesc) && (
          <Text name="Content / Description" fontSize={16} fontWeight={400} lineHeight={28} fill={toHexSafe(t.body, FB)} width="fill-parent">
            {displayDesc}
          </Text>
        )}
        {metadataRows.length > 0 && (
          <>
            <Rectangle name="Content / Divider" width="fill-parent" height={1} fill={toHexSafe(t.divider, FB)} />
            <AutoLayout name="Content / Metadata" direction="vertical" width="fill-parent" spacing={uiTokens.gapMeta}>
              {metadataRows.map((r) => (
            <AutoLayout
              key={r.label}
              name={`Metadata / ${r.label}`}
              direction="horizontal"
              width="fill-parent"
              verticalAlignItems="center"
            >
              <Text fontSize={16} fontWeight={400} fill={toHexSafe(t.label, FB)}>
                {r.label}
              </Text>
              <AutoLayout name="Metadata / Spacer" width="fill-parent" height={1} />
              {typeof r.value === 'string' ? (
                <Text fontSize={16} fontWeight={400} fill={toHexSafe(t.value, FB)}>
                  {r.value}
                </Text>
              ) : (
                r.value
              )}
            </AutoLayout>
          ))}
            </AutoLayout>
          </>
        )}
        <Rectangle name="Content / Divider" width="fill-parent" height={1} fill={toHexSafe(t.divider, FB)} />
        <AutoLayout name="Footer" direction="horizontal" width="fill-parent" verticalAlignItems="center">
          {showAssigned && (
            <AutoLayout name="Footer / Designer" direction="horizontal" spacing={10} verticalAlignItems="center">
              <AutoLayout
                name="Footer / Designer / Avatar"
                width={uiTokens.avatarSize}
                height={uiTokens.avatarSize}
                cornerRadius={999}
                fill={toHexSafe(avatarSlate.bg, FB)}
                stroke={toHexSafe(avatarSlate.border, FB)}
                strokeWidth={1}
                horizontalAlignItems="center"
                verticalAlignItems="center"
              >
                <Text fontSize={18} fontWeight={700} fill={toHexSafe(avatarSlate.initials, FB)}>
                  {getInitials(assignedName)}
                </Text>
              </AutoLayout>
              <AutoLayout name="Footer / Designer / Info" direction="vertical" spacing={4} verticalAlignItems="center">
                <Text fontSize={12} fontWeight={400} fill={toHexSafe(t.label, FB)}>
                  Assigned to
                </Text>
                <Text fontSize={16} fontWeight={400} fill={toHexSafe(t.value, FB)}>
                  {assignedName}
                </Text>
              </AutoLayout>
            </AutoLayout>
          )}
          <AutoLayout name="Footer / Spacer" width="fill-parent" height={1} />
          <AutoLayout
            name="Footer / Status"
            direction="horizontal"
            height={uiTokens.btnH}
            padding={{ vertical: 0, horizontal: 12 }}
            cornerRadius={uiTokens.radiusPill}
            fill={toHexSafe((st && st.bg) || t.btnDefault, FB)}
            horizontalAlignItems="center"
            verticalAlignItems="center"
            spacing={8}
          >
            {hasStatus && STATUS_ICONS[status] && (
              <SVG src={STATUS_ICONS[status]} width={18} height={18} />
            )}
            <Text fontSize={16} fontWeight={600} fill={toHexSafe((st && st.fg) || t.btnDefaultText, FB)}>
              {(st && st.label) || 'Status'}
            </Text>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  )
}

widget.register(DefaultWidget)
