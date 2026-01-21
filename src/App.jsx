import { useState, useEffect } from 'react';
import Header from './widgets/Header';
import BottomNav from './widgets/BottomNav';
import UploadModal from './features/UploadModal';
import ReviewForm from './features/ReviewForm';
import NotificationPanel from './widgets/NotificationPanel';
import DeleteConfirmDialog from './shared/ui/DeleteConfirmDialog';
import CommunityView from './pages/CommunityView';
import ArchiveView from './pages/ArchiveView';
import HomeView from './pages/HomeView';
import WorksView from './pages/WorksView';
import MyView from './pages/MyView';
import DayWorksView from './pages/DayWorksView'; // Import
import WorkDetailView from './pages/WorkDetailView';
import LoginView from './pages/LoginView';
import SignupView from './pages/SignupView';
import useLocalStorage from './hooks/useLocalStorage';
import api from './api/client';
import { compressImage } from './utils/imageCompression';

function App() {
  // Global State
  const [user, setUser] = useLocalStorage('imery-user', null); // { user_id, nickname }
  // UI State
  const [toast, setToast] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [activeView, setActiveView] = useState('home');
  const [activeTab, setActiveTab] = useState('bookmarks'); // Defines tab for detailed views like MyView
  const [currentFile, setCurrentFile] = useState(null);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  // const [currentFile, setCurrentFile] = useState(null); // RAW File object - Removed duplicate

  // Feature State
  const [language, setLanguage] = useState('KO');
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null); // For Calendar Date Click
  const [searchTags, setSearchTags] = useState([]);
  const [notifications, setNotifications] = useState([]); // Array of { id, type, title, message, time }

  // User-scoped Local Storage (Folders & Bookmarks)
  const foldersKey = user ? `imery-folders-${user.user_id}` : 'imery-folders-guest';
  const bookmarksKey = user ? `imery-bookmarks-${user.user_id}` : 'imery-bookmarks-guest';

  // --- Backend Connected State ---
  // No more local overlays needed!
  const [works, setWorks] = useState([]);
  const [folders, setFolders] = useLocalStorage(foldersKey, []);

  // Phase 2 Features State
  const [editingWork, setEditingWork] = useState(null);
  const [deleteConfirmWork, setDeleteConfirmWork] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useLocalStorage(bookmarksKey, []);
  const [selectedRating, setSelectedRating] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [layout, setLayout] = useState('list');
  const [selectedGenre, setSelectedGenre] = useState('전체'); // Filters by genre
  const [myFriendIds, setMyFriendIds] = useState([]); // Array of IDs

  // Fetch works from API
  const refreshWorks = async () => {
    if (!user) return;
    try {
      const [posts, myLikes, friends, bookmarks] = await Promise.all([
        api.getPosts(),
        api.getMyLikes(user.user_id),
        api.getFriends(user.user_id),
        api.getBookmarks(user.user_id)
      ]);

      const bookmarkedIdsFromApi = bookmarks.map(b => b.id);
      setBookmarkedIds(bookmarkedIdsFromApi);

      // Store Friend IDs (Accepted only?) - User said "Friends account". Usually implies accepted.
      // But `getFriends` returns status. Let's filter 'ACCEPTED' or just all?
      // Let's assume 'ACCEPTED'.
      // Filter only ACCEPTED friends for the Community Feed
      const acceptedFriendIds = friends
        .filter(f => f.status === 'ACCEPTED')
        .map(f => f.id);

      setMyFriendIds(acceptedFriendIds);

      // Map to App Structure
      let mappedWorks = posts.map(post => ({
        id: post.id,
        title: post.title,
        artist: post.artist_name || '작가 미상',
        thumbnail: post.image_url,
        image_url: post.image_url, // PRESERVE IMAGE URL
        work_date: post.work_date,
        date: post.work_date || (post.created_at ? post.created_at.split('T')[0].replace(/-/g, '.') : new Date().toISOString().split('T')[0]),
        genre: post.genre || '그림', // Sync Genre
        rating: post.rating || 0,
        review: post.description || '',
        tags: (() => {
          try {
            return post.tags ? JSON.parse(post.tags) : [];
          } catch (e) {
            console.warn("Failed to parse tags for post:", post.id, e);
            return [];
          }
        })(),
        style: post.style || '',
        // AI Analysis Fields
        style1: post.style1 || '',
        style2: post.style2 || '',
        style3: post.style3 || '',
        style4: post.style4 || '',
        style5: post.style5 || '',
        score1: post.score1 || 0,
        score2: post.score2 || 0,
        score3: post.score3 || 0,
        score4: post.score4 || 0,
        score5: post.score5 || 0,
        ai_summary: post.ai_summary,
        music_url: post.music_url,
        user_id: post.user_id,
        nickname: post.nickname,
        like_count: post.like_count,
        is_liked: myLikes.includes(post.id), // Mark if liked
        is_analyzed: post.is_analyzed, // sync is_analyzed
        created_at: post.created_at
      }));
      setWorks(mappedWorks);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleLikeToggle = async (work) => {
    try {
      await api.toggleLike(work.id, user.user_id);
      refreshWorks(); // Refresh to update count and state
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshWorks();
    // Poll notifications every 30s
    if (user) {
      const interval = setInterval(async () => {
        const notes = await api.getNotifications(user.user_id);
        if (notes.length > 0) setNotifications(notes);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  // --- Auth Handlers ---
  const handleLogin = async (username, password) => {
    try {
      const data = await api.login(username, password);
      setUser({
        user_id: data.user_id,
        nickname: data.nickname,
        token: data.token, // Store Token
        email: username
      });
      showToast(`${data.nickname}님 환영합니다!`);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setActiveView('home');
  };

  const handleNavigateHome = () => {
    setActiveView('home');
    setSelectedWork(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateBookmark = () => {
    setActiveView('my');
    setActiveTab('bookmarks');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'KO' ? 'EN' : 'KO');
  };

  // --- Work Logic ---

  const handleUploadClick = () => {
    // RESET EVERYTHING FIRST
    setEditingWork(null);
    setCurrentImage(null);
    setCurrentFile(null);
    setUploadModalOpen(true);
  };

  const handleImageSelected = (imageData, file) => {
    setCurrentImage(imageData);
    setCurrentFile(file); // Store the file
    setUploadModalOpen(false);
    setReviewFormOpen(true);
  };

  const handleSaveReview = async (workData, rawFile) => {
    try {
      const payload = new FormData();
      payload.append('user_id', user.user_id);
      payload.append('title', workData.title);
      payload.append('artist_name', workData.artist_name);
      payload.append('description', workData.description);
      payload.append('rating', workData.rating);
      payload.append('ai_summary', editingWork?.ai_summary || '');
      payload.append('music_url', editingWork?.music_url || '');
      payload.append('work_date', workData.work_date);
      payload.append('genre', workData.genre);
      payload.append('tags', JSON.stringify(workData.tags));
      payload.append('style', workData.style || '');

      // Use rawFile from ReviewForm if any (for editing or direct selection), otherwise fall back to currentFile (from UploadModal)
      const fileToUpload = rawFile || currentFile;

      if (fileToUpload) {
        payload.append('image', fileToUpload);
      } else if (workData.image_url || workData.thumbnail || editingWork?.image_url) {
        // Fallback for existing or non-file based images
        const imgToSave = workData.image_url || workData.thumbnail || editingWork?.image_url;
        payload.append('image_url', imgToSave);
      }

      if (editingWork) {
        await api.updatePost(editingWork.id, payload);
        showToast('작품이 수정되었습니다');
      } else {
        await api.createPost(payload);
        showToast('작품이 업로드되었습니다');
      }

      await refreshWorks();
    } catch (error) {
      alert(`저장 실패: ${error.message}`);
    } finally {
      setReviewFormOpen(false);
      setCurrentImage(null);
      setCurrentFile(null);
      setEditingWork(null);
    }
  };

  const handleEditWork = (work) => {
    // RESET NEW UPLOAD STATES FIRST
    setCurrentImage(null);
    setCurrentFile(null);
    setEditingWork(work);
    setReviewFormOpen(true);
  };

  const handleDeleteClick = (work) => {
    setDeleteConfirmWork(work);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmWork) {
      try {
        await api.deletePost(deleteConfirmWork.id);
        showToast('작품이 삭제되었습니다');
        refreshWorks(); // Refresh list from server
      } catch (error) {
        alert(`삭제 실패: ${error.message}`);
      } finally {
        setDeleteConfirmWork(null);
      }
    }
  };

  const handleBookmarkToggle = async (workId) => {
    try {
      await api.toggleBookmark(user.user_id, workId);
      // Wait for refresh to ensure MyView etc. see the change if needed, 
      // but also update local state for UI snappiness
      setBookmarkedIds(prev =>
        prev.includes(workId)
          ? prev.filter(id => id !== workId)
          : [...prev, workId]
      );
      refreshWorks(); // SYNC GLOBAL STATE
    } catch (e) {
      console.error("Bookmark toggle failed:", e);
    }
  };

  // --- Navigation & UI ---

  // handleNavigateHome and handleLanguageToggle moved to Global Scope


  const handleDateClick = (dateStr) => {
    setSelectedDate(dateStr);
    setActiveView('day_works');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWorkClick = (work) => {
    setSelectedWork(work);
  };

  const handleBackFromDetail = () => {
    setSelectedWork(null);
  };

  const handleTagClick = (tag) => {
    // setSearchTags([tag]);
    // setActiveView('search');
    // Requirement Update: Remove logic to navigate to search.
    console.log("Tag clicked:", tag);
    // Maybe filter in Home? For now, do nothing or just log.
  };

  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedWork(null);

    // Scroll to top on any view change for better UX
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Sync Layout with View for correct filtering
    if (view === 'home') {
      setLayout('list');     // My Works (List)
    } else if (view === 'works') {
      setLayout('medium');   // My Works (Grid)
    } else if (view === 'community') {
      setLayout('large');    // Community (Feed of Friends)
    }
  };

  // --- Render ---

  // Auth Guard
  if (!user) {
    if (authView === 'login') {
      return <LoginView onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />;
    } else {
      return (
        <SignupView
          onSignupSuccess={() => setAuthView('login')}
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  const renderView = () => {
    if (selectedWork) {
      // Find the latest version of the selected work from the works array
      // This ensures we have the latest ai_summary, is_analyzed status, etc.
      const freshWork = works.find(w => w.id === selectedWork.id) || selectedWork;

      return (
        <WorkDetailView
          work={{
            ...freshWork,
            onAnalysisComplete: refreshWorks
          }}
          user={user}
          onBack={() => setSelectedWork(null)}
        />
      );
    }

    // --- Filtering Logic ---
    let filteredWorks = works;
    if (user) {
      if (layout === 'large') {
        // Community Mode: Show Friend's Works ONLY (Exclude My Works)
        // Ensure ID comparison is safe (String vs Number)
        filteredWorks = works.filter(w =>
          myFriendIds.map(id => Number(id)).includes(Number(w.user_id)) &&
          Number(w.user_id) !== Number(user.user_id)
        );
      } else {
        // Home/List Mode: Show ONLY My Works
        filteredWorks = works.filter(w => Number(w.user_id) === Number(user.user_id));
        if (selectedGenre !== '전체') {
          filteredWorks = filteredWorks.filter(w => w.genre === selectedGenre);
        }
      }
    }

    const viewProps = {
      works: activeView === 'works' || activeView === 'my' || activeView === 'archive' ? works : filteredWorks,
      selectedGenre: selectedGenre,
      onGenreChange: setSelectedGenre,
      onUploadClick: handleUploadClick,
      onWorkClick: handleWorkClick,
      onTagClick: handleTagClick,
      onEditClick: handleEditWork,
      onDeleteClick: handleDeleteClick,
      bookmarkedIds: bookmarkedIds,
      onBookmarkToggle: handleBookmarkToggle,
      onLikeToggle: handleLikeToggle,
      selectedRating: selectedRating, // Prop drilling for HomeView
      onRatingChange: setSelectedRating,
      sortBy: sortBy,
      onSortChange: setSortBy,
      layout: layout,
      onLayoutChange: setLayout,
      onViewChange: handleViewChange,
      onNavigateBookmark: handleNavigateBookmark, // Pass for HomeView
      // WorksView specific
      folders: folders,
      setFolders: setFolders,
      // SearchView specific
      initialTags: searchTags,
      onTagsChange: setSearchTags,
    };

    switch (activeView) {
      case 'home':
        return <HomeView {...viewProps} />;

      case 'works':
        return <WorksView {...viewProps} />;
      case 'archive': // Renamed from community
      case 'community': // Fallback
        return (
          <ArchiveView
            works={works} // Pass ALL works
            user={user}
            onLikeToggle={handleLikeToggle}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
            onDateClick={handleDateClick} // Pass to Calendar
          />
        );

      case 'day_works':
        return (
          <DayWorksView
            date={selectedDate}
            works={works}
            onBack={() => setActiveView('archive')}
            onWorkClick={handleWorkClick}
            onLikeToggle={handleLikeToggle}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
          />
        );

      case 'my':
        return <MyView works={works} user={user} onLogout={handleLogout} initialTab={activeTab} />;
      default:
        return <HomeView {...viewProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onNavigateHome={handleNavigateHome}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        onNotificationClick={() => setNotificationPanelOpen(true)}
      />

      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
        notifications={notifications}
        user={user}
      />

      <div className="pt-16 pb-20">
        {renderView()}
      </div>

      <BottomNav
        activeView={activeView}
        onViewChange={handleViewChange}
        onUploadClick={handleUploadClick}
        language={language}
      />

      {uploadModalOpen && (
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onImageSelected={handleImageSelected}
        />
      )}

      {reviewFormOpen && (
        <ReviewForm
          isOpen={reviewFormOpen}
          onClose={() => {
            setReviewFormOpen(false);
            setCurrentImage(null);
            setCurrentFile(null);
            setEditingWork(null);
          }}
          imageData={currentImage}
          onSave={handleSaveReview}
          existingWork={editingWork}
        />
      )}

      <DeleteConfirmDialog
        isOpen={!!deleteConfirmWork}
        onClose={() => setDeleteConfirmWork(null)}
        onConfirm={handleDeleteConfirm}
        workTitle={deleteConfirmWork?.title}
      />

      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-black text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      )}
    </div>
  );
}

export default App;
