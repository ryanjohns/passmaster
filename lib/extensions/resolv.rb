class Resolv

  DOMAIN_REGEX           = /^.+\@/
  BLACKLISTED_MX_DOMAINS = %w(
    mailinator.com
    example.com
    test.com
  )
  WHITELISTED_MX_DOMAINS = %w(
    hotmail.com
    yahoo.com
    gmail.com
    aol.com
    hotmail.co.uk
    live.com
    naver.com
    qq.com
    hotmail.fr
    ymail.com
    163.com
    mail.ru
    msn.com
    yahoo.com.hk
    yahoo.com.tw
    hanmail.net
    nate.com
    yahoo.co.uk
    aim.com
    comcast.net
  )

  def self.valid_email?(email)
    domain = email.gsub(DOMAIN_REGEX, '')
    !BLACKLISTED_MX_DOMAINS.include?(domain) && (WHITELISTED_MX_DOMAINS.include?(domain) || DNS.open.getresources(domain, DNS::Resource::IN::MX).any? { |mx| mx.exchange.to_s.strip.present? })
  rescue
    true
  end

end
