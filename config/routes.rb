Rails.application.routes.draw do
  resource :health_check, :only => [ :show ]

  root :to => 'application#index', :via => :get

  match 'init_session' => 'application#init_session', :via => :get
  match 'offline_sw.js' => 'application#offline_sw', :via => :get
  match 'not_found' => 'application#not_found', :via => :get

  match 'verify/:id' => 'verifications#verify', :via => :get, :as => 'verify'

  resources :users, :only => [ :show, :create, :update, :destroy ] do
    get :backup, :on => :member
    post :resend_verification, :on => :member
    put :verify, :on => :member
  end

  resources :otp_sessions, :only => [ :create ]

  resource :updates, :only => :show

  match '*unmatched', :to => 'application#not_found', :via => :all
end
