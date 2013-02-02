Passmaster::Application.routes.draw do
  match 'healthz' => 'application#healthz', :via => [ :get, :post ]

  root :to => 'application#index', :via => :get
  match "application.manifest" => APPLICATION_MANIFEST, :via => :get

  match 'init_session' => 'application#init_session', :via => :get

  resources :users, :only => [ :show, :create, :update ] do
    get :backup, :on => :member
    post :resend_verification, :on => :member
    put :verify, :on => :member
  end

  resources :otp_sessions, :only => [ :create ]
end
