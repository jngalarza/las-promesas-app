import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const urls = {
  news: 'https://las-promesas-de-genai.netlify.app/data/news.json',
  research: 'https://las-promesas-de-genai.netlify.app/data/research.json',
  episodes: 'https://las-promesas-de-genai.netlify.app/data/episodes.json',
  hosts: 'https://las-promesas-de-genai.netlify.app/data/hosts.json',
};

const colors = {
  background: '#0A0A0A',
  elevated: '#121214',
  card: '#18181B',
  border: '#27272A',
  brightBorder: '#3F3F46',
  text: '#FAFAFA',
  muted: '#A1A1AA',
  dim: '#71717A',
  magenta: '#FF00A8',
  cyan: '#00E5FF',
  yellow: '#FFD400',
};

type NewsItem = {
  id: string;
  fecha: string;
  titulo: string;
  fuente: string;
  url: string;
  imagen?: string;
  resumen: string;
  por_que_importa: string;
  tags: string[];
};

type ResearchItem = {
  id: string;
  fecha: string;
  titulo: string;
  deck: string;
  tipo: string;
  autor: string;
  tiempo_lectura: number;
  imagen?: string;
  destacado: boolean;
  cuerpo: string;
};

type Episode = {
  id: string;
  numero?: number;
  fecha?: string;
  titulo: string;
  deck?: string;
  summary?: string;
  duracion?: string;
  url_video?: string;
  destacado?: boolean;
};

type Host = {
  nombre: string;
  inicial: string;
  bio: string;
  foto?: string;
  linkedin?: string;
  x?: string;
};

type LoadState<T> = {
  data: T;
  loading: boolean;
  error: string;
};

type Section = 'inicio' | 'news' | 'research' | 'show' | 'sobre';
type DetailItem = { type: 'news'; item: NewsItem } | { type: 'research'; item: ResearchItem };

const tabs: { key: Section; label: string }[] = [
  { key: 'inicio', label: 'Inicio' },
  { key: 'news', label: 'News' },
  { key: 'research', label: 'Research' },
  { key: 'show', label: 'The Show' },
  { key: 'sobre', label: 'Sobre' },
];

const aboutIntro =
  'Las Promesas de GenAI es un espacio para separar señal de ruido en inteligencia artificial. No estamos acá para vender promesas. Estamos acá para ponerlas a prueba.';
const aboutHighlight = 'La inteligencia se volvió abundante. El criterio, no.';

export default function HomeScreen() {
  const [activeSection, setActiveSection] = useState<Section>('inicio');
  const [detail, setDetail] = useState<DetailItem | null>(null);
  const [news, setNews] = useState<LoadState<NewsItem[]>>(emptyState([]));
  const [research, setResearch] = useState<LoadState<ResearchItem[]>>(emptyState([]));
  const [episodes, setEpisodes] = useState<LoadState<Episode[]>>(emptyState([]));
  const [hosts, setHosts] = useState<LoadState<Host[]>>(emptyState([]));

  useEffect(() => {
    loadFeed(
      urls.news,
      setNews,
      (data: { items: NewsItem[] }) => sortByDate(data.items),
      'No pudimos cargar News.'
    );
    loadFeed(
      urls.research,
      setResearch,
      (data: { items: ResearchItem[] }) => sortByDate(data.items),
      'No pudimos cargar Research.'
    );
    loadFeed(
      urls.episodes,
      setEpisodes,
      (data: { episodes: Episode[] }) => sortByDate(data.episodes),
      'No pudimos cargar The Show.'
    );
    loadFeed(
      urls.hosts,
      setHosts,
      (data: { hosts: Host[] }) => data.hosts,
      'No pudimos cargar Sobre.'
    );
  }, []);

  if (detail) {
    return <ArticleDetail detail={detail} onBack={() => setDetail(null)} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Text style={styles.kicker}>{'// SYSTEM ONLINE'}</Text>
            <Text style={styles.statusText}>LIVE FEED</Text>
          </View>
          <Text style={styles.logo}>Las Promesas de GenAI</Text>
          <Text style={styles.subtitle}>Señales, research y conversaciones para entender la frontera.</Text>
        </View>

        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => setActiveSection(tab.key)}
              style={[styles.tab, activeSection === tab.key && styles.activeTab]}>
              <Text style={[styles.tabText, activeSection === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeSection === 'inicio' ? (
          <HomeSection
            news={news}
            research={research}
            episodes={episodes}
            onOpenNews={(item) => setDetail({ type: 'news', item })}
            onOpenResearch={(item) => setDetail({ type: 'research', item })}
          />
        ) : null}
        {activeSection === 'news' ? (
          <NewsSection state={news} onOpen={(item) => setDetail({ type: 'news', item })} />
        ) : null}
        {activeSection === 'research' ? (
          <ResearchSection state={research} onOpen={(item) => setDetail({ type: 'research', item })} />
        ) : null}
        {activeSection === 'show' ? <ShowSection state={episodes} /> : null}
        {activeSection === 'sobre' ? <AboutSection state={hosts} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function HomeSection({
  news,
  research,
  episodes,
  onOpenNews,
  onOpenResearch,
}: {
  news: LoadState<NewsItem[]>;
  research: LoadState<ResearchItem[]>;
  episodes: LoadState<Episode[]>;
  onOpenNews: (item: NewsItem) => void;
  onOpenResearch: (item: ResearchItem) => void;
}) {
  const featured = news.data[0];

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{'// DESTACADO HOY'}</Text>
        <FeedStatus state={news} loadingText="Cargando destacado..." />
        {featured ? (
          <Pressable style={styles.featuredCard} onPress={() => onOpenNews(featured)}>
            <View style={styles.accentLine} />
            <Text style={styles.meta}>
              {formatDate(featured.fecha)} / {featured.fuente}
            </Text>
            <Text style={styles.featuredTitle}>{featured.titulo}</Text>
            <Text style={styles.summary}>{featured.resumen}</Text>
            <TagRow tags={featured.tags} tone="yellow" />
          </Pressable>
        ) : null}
      </View>

      <MiniSection label="// LATEST NEWS" state={news}>
        {news.data.slice(0, 3).map((item) => (
          <NewsCard key={item.id} item={item} onPress={() => onOpenNews(item)} compact />
        ))}
      </MiniSection>

      <MiniSection label="// LATEST RESEARCH" state={research}>
        {research.data.slice(0, 2).map((item) => (
          <ResearchCard key={item.id} item={item} onPress={() => onOpenResearch(item)} compact />
        ))}
      </MiniSection>

      <MiniSection label="// THE SHOW" state={episodes}>
        {episodes.data.slice(0, 2).map((episode) => (
          <EpisodeCard key={episode.id} episode={episode} compact />
        ))}
      </MiniSection>
    </>
  );
}

function NewsSection({ state, onOpen }: { state: LoadState<NewsItem[]>; onOpen: (item: NewsItem) => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{'// NEWS'}</Text>
      <FeedStatus state={state} loadingText="Cargando News..." />
      <EmptyState state={state} message="No hay noticias disponibles por ahora." />
      {state.data.map((item) => (
        <NewsCard key={item.id} item={item} onPress={() => onOpen(item)} />
      ))}
    </View>
  );
}

function ResearchSection({
  state,
  onOpen,
}: {
  state: LoadState<ResearchItem[]>;
  onOpen: (item: ResearchItem) => void;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{'// RESEARCH'}</Text>
      <FeedStatus state={state} loadingText="Cargando Research..." />
      <EmptyState state={state} message="No hay research disponible por ahora." />
      {state.data.map((item) => (
        <ResearchCard key={item.id} item={item} onPress={() => onOpen(item)} />
      ))}
    </View>
  );
}

function ShowSection({ state }: { state: LoadState<Episode[]> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{'// THE SHOW'}</Text>
      <FeedStatus state={state} loadingText="Cargando episodios..." />
      <EmptyState state={state} message="No hay episodios disponibles por ahora." />
      {state.data.map((episode) => (
        <EpisodeCard key={episode.id} episode={episode} />
      ))}
    </View>
  );
}

function AboutSection({ state }: { state: LoadState<Host[]> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{'// SOBRE'}</Text>
      <View style={styles.aboutBox}>
        <Text style={styles.body}>{aboutIntro}</Text>
        <Text style={styles.highlight}>{aboutHighlight}</Text>
      </View>
      <FeedStatus state={state} loadingText="Cargando hosts..." />
      <EmptyState state={state} message="No hay hosts disponibles por ahora." />
      {state.data.map((host) => (
        <HostCard key={host.nombre} host={host} />
      ))}
    </View>
  );
}

function MiniSection({
  label,
  state,
  children,
}: {
  label: string;
  state: LoadState<unknown[]>;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <FeedStatus state={state} loadingText="Cargando..." />
      <EmptyState state={state} message="Sin items disponibles." />
      {children}
    </View>
  );
}

function NewsCard({
  item,
  onPress,
  compact = false,
}: {
  item: NewsItem;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable style={[styles.card, compact && styles.compactCard]} onPress={onPress}>
      <View style={[styles.cardAccent, { backgroundColor: colors.yellow }]} />
      <Text style={styles.meta}>
        {formatDate(item.fecha)} / {item.fuente}
      </Text>
      <Text style={styles.cardTitle}>{item.titulo}</Text>
      <Text style={styles.summary} numberOfLines={compact ? 2 : 3}>
        {item.resumen}
      </Text>
      <TagRow tags={item.tags} />
    </Pressable>
  );
}

function ResearchCard({
  item,
  onPress,
  compact = false,
}: {
  item: ResearchItem;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable style={[styles.card, compact && styles.compactCard]} onPress={onPress}>
      <View style={[styles.cardAccent, { backgroundColor: item.destacado ? colors.magenta : colors.cyan }]} />
      <Text style={styles.meta}>
        {formatDate(item.fecha)} / {item.autor} / {item.tiempo_lectura} MIN
      </Text>
      <Text style={styles.cardTitle}>{item.titulo}</Text>
      <Text style={styles.summary} numberOfLines={compact ? 2 : 4}>
        {item.deck}
      </Text>
      <TagRow tags={[item.tipo]} tone={item.destacado ? 'magenta' : 'cyan'} />
    </Pressable>
  );
}

function EpisodeCard({ episode, compact = false }: { episode: Episode; compact?: boolean }) {
  const meta = [
    episode.numero ? `EP ${episode.numero}` : undefined,
    episode.fecha ? formatDate(episode.fecha) : undefined,
    episode.duracion,
  ]
    .filter(Boolean)
    .join(' / ');

  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={[styles.cardAccent, { backgroundColor: colors.magenta }]} />
      <Text style={styles.meta}>{meta || 'THE SHOW'}</Text>
      <Text style={styles.cardTitle}>{episode.titulo}</Text>
      <Text style={styles.summary} numberOfLines={compact ? 2 : 4}>
        {episode.summary || episode.deck || 'Episodio disponible.'}
      </Text>
      {episode.url_video ? (
        <Pressable style={styles.linkButton} onPress={() => Linking.openURL(episode.url_video!)}>
          <Text style={styles.linkButtonText}>Ver episodio</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function HostCard({ host }: { host: Host }) {
  return (
    <View style={[styles.card, styles.hostCard]}>
      <View style={[styles.cardAccent, { backgroundColor: colors.cyan }]} />
      <View style={styles.hostInner}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{host.inicial}</Text>
        </View>
        <View style={styles.hostCopy}>
          <Text style={styles.cardTitle}>{host.nombre}</Text>
          <Text style={styles.summary}>{host.bio}</Text>
          <View style={styles.hostLinks}>
            {host.linkedin && host.linkedin !== '#' ? (
              <Pressable onPress={() => Linking.openURL(host.linkedin!)}>
                <Text style={styles.inlineLink}>LinkedIn</Text>
              </Pressable>
            ) : null}
            {host.x && host.x !== '#' ? (
              <Pressable onPress={() => Linking.openURL(host.x!)}>
                <Text style={styles.inlineLink}>X</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function ArticleDetail({ detail, onBack }: { detail: DetailItem; onBack: () => void }) {
  const isNews = detail.type === 'news';
  const title = detail.item.titulo;
  const meta = isNews
    ? `${formatDate(detail.item.fecha)} / ${detail.item.fuente}`
    : `${formatDate(detail.item.fecha)} / ${detail.item.autor} / ${detail.item.tiempo_lectura} MIN`;
  const tags = isNews ? detail.item.tags : [detail.item.tipo];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>

        <View style={styles.detailHeader}>
          <Text style={styles.sectionLabel}>{isNews ? '// NEWS DETAIL' : '// RESEARCH DETAIL'}</Text>
          <Text style={styles.meta}>{meta}</Text>
          <Text style={styles.detailTitle}>{title}</Text>
          <TagRow tags={tags} tone="magenta" />
        </View>

        {isNews ? (
          <>
            <DetailBlock label="// RESUMEN" text={detail.item.resumen} />
            <DetailBlock label="// POR QUE IMPORTA" text={detail.item.por_que_importa} />
            <SourceBlock url={detail.item.url} />
          </>
        ) : (
          <>
            <DetailBlock label="// DECK" text={detail.item.deck} />
            <DetailBlock label="// CUERPO" text={cleanArticleBody(detail.item.cuerpo)} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailBlock({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.detailBlock}>
      <Text style={styles.blockLabel}>{label}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

function SourceBlock({ url }: { url: string }) {
  return (
    <View style={styles.sourceBox}>
      <Text style={styles.blockLabel}>{'// FUENTE'}</Text>
      <Text style={styles.sourceUrl}>{url}</Text>
    </View>
  );
}

function FeedStatus<T>({ state, loadingText }: { state: LoadState<T>; loadingText: string }) {
  if (state.loading) {
    return (
      <View style={styles.stateBox}>
        <View style={styles.stateHeader}>
          <ActivityIndicator color={colors.cyan} />
          <Text style={styles.stateLabel}>{'// LOADING'}</Text>
        </View>
        <Text style={styles.stateText}>{loadingText}</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.stateBox}>
        <Text style={styles.errorLabel}>{'// ERROR'}</Text>
        <Text style={styles.stateText}>{state.error}</Text>
      </View>
    );
  }

  return null;
}

function EmptyState<T>({ state, message }: { state: LoadState<T[]>; message: string }) {
  if (state.loading || state.error || state.data.length > 0) {
    return null;
  }

  return (
    <View style={styles.stateBox}>
      <Text style={styles.stateLabel}>{'// EMPTY'}</Text>
      <Text style={styles.stateText}>{message}</Text>
    </View>
  );
}

function TagRow({ tags, tone = 'cyan' }: { tags: string[]; tone?: 'cyan' | 'yellow' | 'magenta' }) {
  const tagColor = tone === 'yellow' ? colors.yellow : tone === 'magenta' ? colors.magenta : colors.cyan;

  return (
    <View style={styles.tags}>
      {tags.map((tag) => (
        <View key={tag} style={[styles.tag, { borderColor: tagColor }]}>
          <Text style={[styles.tagText, { color: tagColor }]}>{tag}</Text>
        </View>
      ))}
    </View>
  );
}

async function loadFeed<TResponse, TValue>(
  url: string,
  setState: React.Dispatch<React.SetStateAction<LoadState<TValue>>>,
  selectData: (data: TResponse) => TValue,
  errorMessage: string
) {
  setState((current) => ({ ...current, loading: true, error: '' }));

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    const data = (await response.json()) as TResponse;
    setState({ data: selectData(data), loading: false, error: '' });
  } catch {
    setState((current) => ({ ...current, loading: false, error: errorMessage }));
  }
}

function emptyState<T>(data: T): LoadState<T> {
  return { data, loading: true, error: '' };
}

function sortByDate<T extends { fecha?: string }>(items: T[]) {
  return [...items].sort((a, b) => new Date(b.fecha || '').getTime() - new Date(a.fecha || '').getTime());
}

function formatDate(date?: string) {
  if (!date) {
    return 'SIN FECHA';
  }

  return new Intl.DateTimeFormat('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

function cleanArticleBody(body: string) {
  return body
    .replace(/<[^>]+>/g, '')
    .replace(/^#+\s+/gm, '')
    .replace(/---/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screen: {
    gap: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 42,
    backgroundColor: colors.background,
  },
  header: {
    gap: 10,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  kicker: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  statusText: {
    color: colors.yellow,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  logo: {
    color: colors.text,
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 34,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 4,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    minWidth: '30%',
    flexGrow: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 11,
  },
  activeTab: {
    borderColor: colors.magenta,
    backgroundColor: colors.card,
  },
  tabText: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  activeTabText: {
    color: colors.text,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    color: colors.yellow,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: colors.magenta,
  },
  featuredCard: {
    gap: 13,
    padding: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.brightBorder,
  },
  accentLine: {
    width: 72,
    height: 3,
    backgroundColor: colors.magenta,
  },
  meta: {
    color: colors.dim,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  featuredTitle: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 31,
  },
  card: {
    gap: 11,
    padding: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardAccent: {
    width: 44,
    height: 2,
  },
  compactCard: {
    padding: 14,
    gap: 9,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  summary: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    paddingTop: 3,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: colors.elevated,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  stateBox: {
    gap: 10,
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stateLabel: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  errorLabel: {
    color: colors.magenta,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  stateText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  aboutBox: {
    gap: 16,
    padding: 18,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.brightBorder,
  },
  highlight: {
    color: colors.yellow,
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 28,
  },
  hostCard: {
    gap: 13,
  },
  hostInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatar: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cyan,
    backgroundColor: colors.elevated,
  },
  avatarText: {
    color: colors.cyan,
    fontSize: 22,
    fontWeight: '900',
  },
  hostCopy: {
    flex: 1,
    gap: 8,
  },
  hostLinks: {
    flexDirection: 'row',
    gap: 14,
  },
  inlineLink: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  linkButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.magenta,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: colors.elevated,
  },
  linkButtonText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  backButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.brightBorder,
    paddingHorizontal: 13,
    paddingVertical: 9,
    backgroundColor: colors.elevated,
  },
  backText: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailHeader: {
    gap: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  detailTitle: {
    color: colors.text,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 35,
  },
  detailBlock: {
    gap: 12,
    padding: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  blockLabel: {
    color: colors.cyan,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  body: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 25,
  },
  sourceBox: {
    gap: 10,
    padding: 16,
    backgroundColor: colors.elevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sourceUrl: {
    color: colors.dim,
    fontSize: 13,
    lineHeight: 20,
  },
});
